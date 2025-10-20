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
    Fetch Google Maps place reviews using a given place_id.
    Example request: /api/place_reviews?place_id=YOUR_PLACE_ID
    """
    place_id = request.GET.get("place_id")
    if not place_id:
        return JsonResponse({"error": "place_id parameter is required"}, status=400)

    api_key = os.getenv("GOOGLE_MAPS_API_KEY")
    if not api_key:
        return JsonResponse({"error": "API key not configured"}, status=500)

    url = (
        "https://maps.googleapis.com/maps/api/place/details/json"
        f"?place_id={place_id}&fields=name,rating,reviews&key={api_key}"
    )

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()

        # Check if the response from Google contains an error
        if data.get("status") != "OK":
            return JsonResponse({"error": data.get("error_message", "Invalid place_id")}, status=400)

        return JsonResponse(data)

    except requests.exceptions.Timeout:
        return JsonResponse({"error": "Request to Google Maps API timed out"}, status=504)
    except requests.exceptions.RequestException as e:
        return JsonResponse({"error": f"Request failed: {str(e)}"}, status=500)
