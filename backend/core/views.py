import requests
from django.http import JsonResponse


def place_reviews(request):
    place_id = request.GET.get("place_id")
    if not place_id:

        return JsonResponse({"error": "place_id parameter is required"}, status=400)

    api_key = "YOUR_GOOGLE_API_KEY" 
    url = f"https://maps.googleapis.com/maps/api/place/details/json?place_id={place_id}&fields=name,rating,reviews&key={api_key}"
    response = requests.get(url)
    data = response.json()


    return JsonResponse(data)
