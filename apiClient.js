/**
 * KrishiUrja BioRefinery Platform
 * Minimal Vanilla JavaScript API Client (Phase 2 MERN Bridge)
 * Base URL: http://localhost:5000/api
 */

class ApiClientClass {
  constructor(baseURL = 'http://localhost:5000/api') {
    this.baseURL = baseURL;
    this.token = null;
  }

  /**
   * Set the authenticated user's Firebase token for subsequent requests
   * @param {string|null} token
   */
  setToken(token) {
    this.token = token;
  }

  /**
   * Internal helper to build request headers, automatically appending
   * the Firebase Bearer token if the user is authenticated.
   */
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Verify Firebase JWT with backend and synchronize user record in MongoDB
   * @param {string} firebaseToken
   * @returns {Promise<Object>} MongoDB User Document
   */
  async verifyUser(firebaseToken) {
    this.setToken(firebaseToken);

    const response = await fetch(`${this.baseURL}/auth/verify-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token: firebaseToken })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `HTTP ${response.status}: Failed to verify token`);
    }

    const mongoUser = await response.json();
    return mongoUser;
  }

  /**
   * Save a new formulation recipe to MongoDB
   * Automatically attaches Bearer token header if user is logged in
   * @param {Object} recipeData
   * @returns {Promise<Object>}
   */
  async saveRecipe(recipeData) {
    const response = await fetch(`${this.baseURL}/recipes`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(recipeData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `HTTP ${response.status}: Failed to save recipe`);
    }

    return await response.json();
  }

  /**
   * Fetch all public formulation recipes
   * Automatically attaches Bearer token header if user is logged in
   * @returns {Promise<Array>}
   */
  async getRecipes() {
    const response = await fetch(`${this.baseURL}/recipes`, {
      method: 'GET',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `HTTP ${response.status}: Failed to fetch recipes`);
    }

    return await response.json();
  }
}

// Instantiate default singleton instance pointing to backend
const ApiClient = new ApiClientClass(
  window.KrishiConfig?.API_BASE_URL || 'http://localhost:5000/api'
);

// Expose globally to window
window.ApiClient = ApiClient;
window.ApiClientClass = ApiClientClass;
