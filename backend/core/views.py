import os
import requests
from django.http import JsonResponse
from django.views.decorators.http import require_GET
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

@require_GET
def place_reviews(request):
    """
    Fetch Google Maps place reviews for a business.
    Example request: /api/place_reviews?name=Royal+Auto+And+Body+Repair
    or /api/place_reviews?place_id=PLACE_ID
    """
    api_key = os.getenv("GOOGLE_MAPS_API_KEY")
    if not api_key:
        return JsonResponse({"error": "API key not configured"}, status=500)

    place_id = request.GET.get("place_id")
    business_name = request.GET.get("name", "Royal Auto And Body Repair, Sacramento, CA")

    # If place_id is not provided, get it via business name
    if not place_id:
        if not business_name:
            return JsonResponse({"error": "Either place_id or name parameter is required"}, status=400)

        # Find Place API to get place_id
        find_url = "https://maps.googleapis.com/maps/api/place/findplacefromtext/json"
        params = {
            "input": business_name,
            "inputtype": "textquery",
            "fields": "place_id",
            "key": api_key
        }
        try:
            response = requests.get(find_url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            if not data.get("candidates"):
                return JsonResponse({"error": "Business not found"}, status=404)
            place_id = data["candidates"][0]["place_id"]
        except requests.exceptions.RequestException as e:
            return JsonResponse({"error": f"Failed to get place_id: {str(e)}"}, status=500)

    # Now get place details and reviews
    details_url = "https://maps.googleapis.com/maps/api/place/details/json"
    params = {
        "place_id": place_id,
        "fields": "name,rating,reviews",
        "key": api_key
    }

    try:
        response = requests.get(details_url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        if data.get("status") != "OK":
            return JsonResponse({"error": data.get("error_message", "Invalid place_id")}, status=400)

        return JsonResponse(data)

    except requests.exceptions.Timeout:
        return JsonResponse({"error": "Request to Google Maps API timed out"}, status=504)
    except requests.exceptions.RequestException as e:
        return JsonResponse({"error": f"Request failed: {str(e)}"}, status=500)
