"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {

  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */
  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /** Parses hostname out of URL and returns it. */
  getHostName() {
    // UNIMPLEMENTED: complete this function!
    return new URL(this.url).hostname; // This extracts the hostname from the URL
  }
}

/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */
  static async getStories() {
    const response = await axios({
      url: `${BASE_URL}/stories`,  // Ensure the API URL is correct
      method: "GET",
    });

    console.log("API response:", response); // Check the response here

    // Ensure the response has stories and log the response
    const stories = response.data.stories ? response.data.stories.map(story => new Story(story)) : [];

    if (stories.length === 0) {
      console.error("No stories found.");
    }

    return new StoryList(stories);
  }

  /** Adds story data to API, makes a Story instance, adds it to story list.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */
  async addStory(user, newStory) {
    const data = {
      token: user.loginToken,
      story: {
        author: newStory.author,
        title: newStory.title,
        url: newStory.url
      }
    };

    let response = await $.ajax({
      url: "https://hack-or-snooze-v3.herokuapp.com/stories",
      method: "POST",
      data: JSON.stringify(data),
      contentType: "application/json"
    });

    console.log("API Response:", response); // Log the response from the server

    return new Story(response.story);  // Create a new story instance from the response
  }

  async deleteStory(storyId) {
    const data = { token: currentUser.loginToken };  // Use the logged-in user's token
  
    try {
      const response = await axios({
        url: `${BASE_URL}/stories/${storyId}`,
        method: "DELETE",
        data,
        headers: {
          Authorization: `Bearer ${currentUser.loginToken}`  // Or send token in header if required by the API
        }
      });
      console.log("Story deleted:", response);
    } catch (error) {
      console.error("Error deleting story:", error);
    }
  }
  
}

/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */
  constructor({
                username,
                name,
                createdAt,
                favorites = [],
                ownStories = []
              },
              token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map(s => new Story(s));
    this.ownStories = ownStories.map(s => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  async addFavorite(story) {
    const url = `${BASE_URL}/users/${this.username}/favorites/${story.storyId}`;
    const data = {token: this.loginToken};

    console.log(url, data)

    await axios.post(url, data);
    this.favorites.push(story);
  }

  async deleteFavorite(story) {
    const url = `${BASE_URL}/users/${this.username}/favorites/${story.storyId}`;
    const data = {token: this.loginToken};

    console.log(url, data)

    await axios.delete(url, data);
    this.favorites = this.favorites.filter(s => s.storyId !== story.storyId);
  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */
  static async signup(username, password, name) {
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    });

    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** Login in user with API, make User instance & return it.
   *
   * - username: an existing user's username
   * - password: an existing user's password
   */
  static async login(username, password) {
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    });

    const { user, token } = response.data;  

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      token
    );
  }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */
  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      let { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }
}