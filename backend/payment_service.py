import os
from dotenv import load_dotenv

load_dotenv()

# Razorpay is optional — only needed when real payments are configured
try:
    import razorpay
    _KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
    _KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")
    if _KEY_ID and _KEY_SECRET and "your_key" not in _KEY_ID:
        client = razorpay.Client(auth=(_KEY_ID, _KEY_SECRET))
        RAZORPAY_READY = True
    else:
        client = None
        RAZORPAY_READY = False
except ImportError:
    client = None
    RAZORPAY_READY = False
    print("razorpay not installed — running in demo mode. Run: pip install razorpay")

PLANS = {
    "weekly":    {"amount": 24900,  "currency": "INR", "name": "Weekly Plan",    "duration_days": 7},
    "monthly":   {"amount": 57900,  "currency": "INR", "name": "Monthly Plan",   "duration_days": 30},
    "quarterly": {"amount": 124900, "currency": "INR", "name": "Quarterly Plan", "duration_days": 90},
    "yearly":    {"amount": 249900, "currency": "INR", "name": "Yearly Plan",    "duration_days": 365},
}


def create_order(plan_id: str) -> dict:
    plan = PLANS.get(plan_id)
    if not plan:
        raise ValueError(f"Unknown plan: {plan_id}")

    if not RAZORPAY_READY or client is None:
        return {
            "order_id": f"demo_{plan_id}_{os.urandom(4).hex()}",
            "amount": plan["amount"],
            "currency": plan["currency"],
            "plan_name": plan["name"],
            "duration_days": plan["duration_days"],
            "key_id": "",
            "demo": True,
        }

    order = client.order.create({
        "amount": plan["amount"],
        "currency": plan["currency"],
        "payment_capture": 1,
    })
    return {
        "order_id": order["id"],
        "amount": order["amount"],
        "currency": order["currency"],
        "plan_name": plan["name"],
        "duration_days": plan["duration_days"],
        "key_id": os.getenv("RAZORPAY_KEY_ID", ""),
        "demo": False,
    }


def verify_payment(razorpay_order_id: str, razorpay_payment_id: str, razorpay_signature: str) -> bool:
    if razorpay_order_id.startswith("demo_"):
        return True
    if not RAZORPAY_READY or client is None:
        return False
    try:
        client.utility.verify_payment_signature({
            "razorpay_order_id": razorpay_order_id,
            "razorpay_payment_id": razorpay_payment_id,
            "razorpay_signature": razorpay_signature,
        })
        return True
    except Exception:
        return False