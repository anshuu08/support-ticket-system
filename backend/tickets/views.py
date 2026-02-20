from django.db.models import Count
from django.db.models.functions import TruncDate
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django_filters.rest_framework import DjangoFilterBackend

from .models import Ticket, Comment
from .serializers import TicketSerializer, CommentSerializer, RegisterSerializer, UserSerializer
from .llm import classify_ticket, suggest_reply


# ── Auth endpoints ────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'username': user.username,
            'is_staff': user.is_staff,
            'user_id': user.id,
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user:
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'username': user.username,
            'is_staff': user.is_staff,
            'user_id': user.id,
        })
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
def logout_view(request):
    try:
        request.user.auth_token.delete()
    except Exception:
        pass
    return Response({'message': 'Logged out'})


@api_view(['GET'])
def me(request):
    return Response({
        'username': request.user.username,
        'is_staff': request.user.is_staff,
        'user_id': request.user.id,
        'email': request.user.email,
    })


# ── Ticket ViewSet ────────────────────────────────────────────────────────────

class TicketViewSet(viewsets.ModelViewSet):
    serializer_class = TicketSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'priority', 'status', 'assigned_to']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'priority', 'status', 'due_date']
    http_method_names = ['get', 'post', 'patch', 'delete']
    permission_classes = [IsAuthenticated]

    PRIORITY_ORDER = {'critical': 0, 'high': 1, 'medium': 2, 'low': 3}

    def get_queryset(self):
        qs = Ticket.objects.all() if self.request.user.is_staff else \
             Ticket.objects.filter(owner=self.request.user)
        # Custom sort by priority weight
        sort = self.request.query_params.get('sort')
        if sort == 'priority':
            from django.db.models import Case, When, IntegerField
            qs = qs.annotate(priority_order=Case(
                When(priority='critical', then=0), When(priority='high', then=1),
                When(priority='medium', then=2), When(priority='low', then=3),
                output_field=IntegerField()
            )).order_by('priority_order', '-created_at')
        elif sort == 'oldest':
            qs = qs.order_by('created_at')
        elif sort == 'due_date':
            qs = qs.order_by('due_date', '-created_at')
        else:
            qs = qs.order_by('-created_at')
        return qs

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    # ── Stats ────────────────────────────────────────────────────────────────

    @action(detail=False, methods=['get'])
    def stats(self, request):
        tickets = self.get_queryset()
        total = tickets.count()
        open_tickets = tickets.filter(status='open').count()
        overdue = sum(1 for t in tickets if t.is_overdue)

        daily_counts = (
            tickets.annotate(date=TruncDate('created_at'))
            .values('date').annotate(count=Count('id'))
        )
        avg_per_day = round(total / daily_counts.count(), 1) if daily_counts.exists() else 0.0

        priority_breakdown = {p: 0 for p in ['low', 'medium', 'high', 'critical']}
        for row in tickets.values('priority').annotate(count=Count('id')):
            priority_breakdown[row['priority']] = row['count']

        category_breakdown = {c: 0 for c in ['billing', 'technical', 'account', 'general']}
        for row in tickets.values('category').annotate(count=Count('id')):
            category_breakdown[row['category']] = row['count']

        status_breakdown = {s: 0 for s in ['open', 'in_progress', 'resolved', 'closed']}
        for row in tickets.values('status').annotate(count=Count('id')):
            status_breakdown[row['status']] = row['count']

        return Response({
            'total_tickets': total,
            'open_tickets': open_tickets,
            'overdue_tickets': overdue,
            'avg_tickets_per_day': avg_per_day,
            'priority_breakdown': priority_breakdown,
            'category_breakdown': category_breakdown,
            'status_breakdown': status_breakdown,
        })

    # ── Classify ─────────────────────────────────────────────────────────────

    @action(detail=False, methods=['post'])
    def classify(self, request):
        description = request.data.get('description', '').strip()
        if not description:
            return Response({'error': 'description is required'}, status=status.HTTP_400_BAD_REQUEST)
        result = classify_ticket(description)
        if result is None:
            return Response({'error': 'Classification unavailable'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        return Response(result)

    # ── AI Suggested Reply ───────────────────────────────────────────────────

    @action(detail=True, methods=['get'])
    def suggest_reply(self, request, pk=None):
        ticket = self.get_object()
        reply = suggest_reply(ticket.title, ticket.description, ticket.category)
        if reply is None:
            return Response({'error': 'Suggestion unavailable'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        return Response({'suggested_reply': reply})

    # ── Bulk Actions ─────────────────────────────────────────────────────────

    @action(detail=False, methods=['post'])
    def bulk_update(self, request):
        ids = request.data.get('ids', [])
        updates = request.data.get('updates', {})
        allowed_fields = {'status', 'priority', 'category', 'assigned_to'}
        updates = {k: v for k, v in updates.items() if k in allowed_fields}
        if not ids or not updates:
            return Response({'error': 'ids and updates required'}, status=status.HTTP_400_BAD_REQUEST)
        qs = self.get_queryset().filter(id__in=ids)
        qs.update(**updates)
        return Response({'updated': qs.count()})

    # ── Export CSV ───────────────────────────────────────────────────────────

    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        import csv
        from django.http import HttpResponse
        tickets = self.get_queryset()
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="tickets.csv"'
        writer = csv.writer(response)
        writer.writerow(['ID', 'Title', 'Category', 'Priority', 'Status', 'Owner', 'Created', 'Due Date'])
        for t in tickets:
            writer.writerow([t.id, t.title, t.category, t.priority, t.status,
                             t.owner.username, t.created_at.strftime('%Y-%m-%d %H:%M'),
                             t.due_date or ''])
        return response


# ── Comment ViewSet ───────────────────────────────────────────────────────────

class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'delete']

    def get_queryset(self):
        ticket_id = self.kwargs.get('ticket_pk')
        qs = Comment.objects.filter(ticket_id=ticket_id)
        # Non-staff can't see internal comments
        if not self.request.user.is_staff:
            qs = qs.filter(is_internal=False)
        return qs

    def perform_create(self, serializer):
        ticket_id = self.kwargs.get('ticket_pk')
        # Only staff can post internal comments
        is_internal = self.request.data.get('is_internal', False)
        if not self.request.user.is_staff:
            is_internal = False
        serializer.save(author=self.request.user, ticket_id=ticket_id, is_internal=is_internal)


# ── Staff list ────────────────────────────────────────────────────────────────

@api_view(['GET'])
def staff_list(request):
    users = User.objects.filter(is_staff=True)
    return Response(UserSerializer(users, many=True).data)
