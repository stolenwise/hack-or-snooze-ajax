"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

const $allStoriesList = $("#all-stories-list");
const $storiesLoadingMsg = $("#stories-loading-msg");

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
          ${story.title}
          <span class="star" data-story-id="${story.storyId}">☆</span>
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
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

// Form submission for new story
async function submitNewStory(evt) {
  evt.preventDefault();
  
  if (!storyList) {
    console.error("storyList is not initialized yet!");
    return;
  }

  const title = $("#title").val();
  const author = $("#author").val();
  const url = $("#url").val();

  const newStoryData = {title, author, url};

  console.log("User submitted:", title, author, url);
  try {
    const story = await storyList.addStory(currentUser, newStoryData);
    const $story = generateStoryMarkup(story);
    $allStoriesList.prepend($story);
    $("#submit-form").trigger("reset").hide();
  } catch (err) {
    console.error("Error submitting new story:", err);
  }
}




// Handle form submission
$("#submit-form").on("submit", submitNewStory);

// Toggle favorite functionality
async function toggleFavorite(evt) {
  console.log("Star clicked!");
}

$allStoriesList.on("click", ".star", toggleFavorite);

