"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

$(document).ready(function () {
  const $allStoriesList = $("#all-stories-list");
});



/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

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
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }


  $allStoriesList.show();
}


async function submitNewStory(evt) {
  evt.preventDefault();
  
  const title = $("#title").val();
  const author = $("#author").val();
  const url = $("#url").val();

  const newStoryData = {title, author, url}

  console.log("User submitted:", title, author, url);

  const story = await storyList.addStory(currentUser, newStoryData);
  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);
  $("#submit-form").trigger("reset").hide();
}

$("submit-form").on("submit", submitNewStory);


$("#submit-form").on("submit", function(evt) {
  evt.preventDefault();
  console.log("Form submit caught!");
});

async function toggleFavorite(evt) {
  console.log("Star clicked!");
}

$allStoriesList.on("click", ".star", toggleFavorite);
