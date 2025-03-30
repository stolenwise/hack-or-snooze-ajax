"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

// const $allStoriesList = $("#all-stories-list");
// const $storiesLoadingMsg = $("#stories-loading-msg");

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  try {
    // Fetch stories from the API
    storyList = await StoryList.getStories();  
    console.log('Fetched storyList:', storyList);

    // Check if storyList or storyList.stories is undefined
    if (!storyList || !storyList.stories) {
      console.error('storyList is undefined or has no stories');
      return;
    }
    
    console.log('storyList has been successfully initialized!');
    
    $storiesLoadingMsg.remove();
    putStoriesOnPage();
  } catch (error) {
    console.error('Error fetching stories:', error);
  }
}

$(window).on('load', getAndShowStoriesOnStart);
/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}</a>
          <span class="star" data-story-id="${story.storyId}">☆</span>
          <span class="delete-button" data-story-id="${story.storyId}">🗑️</span>
        
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author" style="color: green">by ${story.author}</small>
        <small class="story-user" style="color: rgb(228, 179, 63)">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

async function submitNewStory(evt) {
  evt.preventDefault(); // Prevent the default form submission action

  // Ensure the user is logged in
  if (!currentUser) {
    console.error("User is not logged in!");
    return;
  }

  // Get the values from the form fields
  const title = $("#title-input").val();    // Get title from the input field
  const author = $("#author-input").val();  // Get author from the input field
  const url = $("#story-url-input").val();  // Get story URL from the input field

  // Debugging step to check if values are being captured correctly
  console.log("Form Values:", title, author, url); // Check the values here

  // Create an object for the new story
  const newStoryData = { title, author, url };

  try {
    // Call the function to add the new story
    const story = await storyList.addStory(currentUser, newStoryData);
    
    // Create HTML for the new story and prepend it to the list
    const $story = generateStoryMarkup(story);
    $allStoriesList.prepend($story);

  
   // When a user logs in, show the new story form
$("#new-story-form").removeClass("hidden");
// Hide the form again
  } catch (err) {
    console.error("Error submitting new story:", err);
  }
}


// form submission handler
$("#new-story-form").on("submit", submitNewStory);



// Toggle favorite functionality
async function toggleFavorite(evt) {
  // Get the story ID from the clicked star
  const storyId = $(evt.target).data("story-id");
  const story = storyList.stories.find(story => story.storyId === storyId);

  // Toggle the favorite state (you may want to track this in the story object or in the UI)
  story.isFavorite = !story.isFavorite;

  // Change the icon or text based on the favorite status
  if (story.isFavorite) {
    $(evt.target).text('★'); // Filled star
  } else {
    $(evt.target).text('☆'); // Empty star
  }

  // Optionally, update the backend about the new favorite status here
  try {
    await storyList.updateStoryFavoriteStatus(storyId, story.isFavorite);
  } catch (error) {
    console.error("Error updating favorite status:", error);
  }
}

$allStoriesList.on("click", ".star", toggleFavorite);

async function deleteStory(evt) {
  const storyId = $(evt.target).data("story-id");  // Get the story ID from the delete button
  const story = storyList.stories.find(story => story.storyId === storyId);  // Find the story

  if (!story) {
    console.error("Story not found.");
    return;  // Stop execution if the story is not found
  }

  // Ensure the current user is the owner of the story
  if (story.username !== currentUser.username) {
    console.error("You can only delete your own stories.");
    return; // Stop execution if the user is not the owner of the story
  }

  try {
    // Make the API call to delete the story
    await storyList.deleteStory(storyId);
    $(`#${storyId}`).remove();  // Remove the story from the DOM
  } catch (error) {
    console.error("Error deleting story:", error);
  }
}

$allStoriesList.on("click", ".delete-button", deleteStory);


