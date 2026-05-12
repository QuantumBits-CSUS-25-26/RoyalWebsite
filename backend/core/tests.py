from django.test import TestCase, Client

#GET facebook posts unit test
class FacebookPostsViewTest(TestCase):
	def setUp(self):
		self.client = Client()

	def test_facebook_posts_endpoint(self):
		response = self.client.get('/api/facebook-posts/')
		self.assertEqual(response.status_code, 200)
		self.assertIn('data', response.json())

