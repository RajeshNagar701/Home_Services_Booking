"""
HomeServe Technologies - Database Seeding Package
Provides realistic dummy data for testing and demonstration across all four roles:
Super Admin, Customer, Service Provider, and Technician.
"""

from .demo_accounts import (
    ADMIN_USER,
    CUSTOMER_USERS,
    SERVICE_PROVIDERS,
    TECHNICIANS,
    SERVICE_CATEGORIES,
    SERVICE_LISTINGS,
    AHMEDABAD_ADDRESSES,
    SAMPLE_COUPONS,
    SUBSCRIPTION_PLANS,
)

__all__ = [
    "ADMIN_USER",
    "CUSTOMER_USERS",
    "SERVICE_PROVIDERS",
    "TECHNICIANS",
    "SERVICE_CATEGORIES",
    "SERVICE_LISTINGS",
    "AHMEDABAD_ADDRESSES",
    "SAMPLE_COUPONS",
    "SUBSCRIPTION_PLANS",
]
