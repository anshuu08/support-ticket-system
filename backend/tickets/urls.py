from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers as nested_routers
from .views import (TicketViewSet, CommentViewSet,
                    register, login_view, logout_view, me, staff_list)

router = DefaultRouter()
router.register(r'tickets', TicketViewSet, basename='ticket')

# Nested: /api/tickets/{ticket_pk}/comments/
tickets_router = nested_routers.NestedDefaultRouter(router, r'tickets', lookup='ticket')
tickets_router.register(r'comments', CommentViewSet, basename='ticket-comments')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(tickets_router.urls)),
    path('auth/register/', register),
    path('auth/login/', login_view),
    path('auth/logout/', logout_view),
    path('auth/me/', me),
    path('staff/', staff_list),
]
