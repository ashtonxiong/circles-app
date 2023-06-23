import apiRequest from "./apirequest.js";
import User, { Post } from "./user.js";

export default class App {
  constructor() {
    this._user = null;

    this._onListUsers = this._onListUsers.bind(this);
    this._login = this._login.bind(this);
    this._post = this._post.bind(this);
    this._updateName = this._updateName.bind(this);
    this._showFeed = this._showFeed.bind(this);
    this._createCircle = this._createCircle.bind(this);

    this._loginForm = document.querySelector("#loginForm");

    this._loginButton = document.querySelector("[name='login']");
    this._loginButton.addEventListener("click", this._login);
    this._userLogin = document.querySelector("[name='userid']");

    this._postButton = document.querySelector("#postButton");
    this._postButton.addEventListener("click", this._post);
    this._postComment = document.querySelector("#newPost");

    this._name = document.querySelector(".name");

    this._followingList = document.querySelector("#followContainer");

    this._classes = document.querySelector("#classes");
    this._classSelect = document.querySelector("#classSelect");
    this._classSelect.addEventListener("click", this._showFeed);

    this._createCircleButton = document.querySelector("#createCircle");
    this._circleName = document.querySelector("#circleName");
    this._createCircleButton.addEventListener("click", this._createCircle);

    this._allCircles = document.querySelector("#classes");

    this._currentFeed = undefined;
    this._hasFeed = false;
    this._currentCircle = undefined;
  }


  async _onListUsers() {
    let users = await User.listUsers();
    let usersStr = users.join("\n");
    alert(`List of users:\n\n${usersStr}`);
  }


  _clearData() {
    let dropDown = this._allCircles;
    let children = Array.from(dropDown.children);
    for (let elem of children) {
      elem.remove();
    }
  }

  async _createCircle(event) {
    event.preventDefault();
    let newName = this._circleName.value;
    await apiRequest("POST", `/classes/${newName}`, { circle: newName });
    this._clearData();
    this._loadData();
  }

  async _resetFeed() {
    let feed = document.querySelector("#feed");
    let children = Array.from(feed.children); // Create a copy of the children collection
    for (let child of children) {
      child.remove();
    }
    this._hasFeed = false;
  }

  async _showFeed(event) {
    event.preventDefault();
    if (this._hasFeed) {
      this._resetFeed();
    }
    let cl = this._classes.value; // the class year
    this._currentCircle = cl;
    let data = await apiRequest("GET", `/classes/${cl}`);
    this._currentFeed = data;
    let allPosts = await apiRequest("GET", `/posts`);
    for (let post of allPosts) {
      if (post.class === cl) {
        let user = await apiRequest("GET", `/users/${post.userId}`);
        let newObj = new Post({
          user: user,
          time: post.time,
          text: post.text
        });
        this._displayPost(newObj);
      }
    }
    this._hasFeed = true;
  }

  async _loadData() {
    let dropDown = this._allCircles;
    let allCircles = await apiRequest("GET", "/classes");
    for (let circle of allCircles) {
      let newOption = document.createElement("option");
      newOption.value = circle.circle;
      newOption.textContent = circle.circle;
      dropDown.append(newOption);
    }
  }

  async _login(event) {
    event.preventDefault();
    let input = this._userLogin.value;
    let data = await User.loadOrCreate(input);
    this._user = new User(data);
    this._name.textContent = this._user.name;
    this._loadProfile();
    this._loadData();
  }

  async _post(event) {
    event.preventDefault();
    if (!this._hasFeed) {
      alert("Please select a circle first");
      return;
    }
    let text = this._postComment.value;
    let user = this._user;
    let post = await user.makePost(text, this._currentCircle);
    let postObj = new Post({
      user: user,
      text: text,
      time: new Date()
    });
    this._displayPost(postObj);
  }

  async _updateName(event) {
    event.preventDefault();
    let newName = this._displayName.value;
    this._name.textContent = newName;
    this._displayName.value = "";
  }


  /*** Helper methods ***/

  /* Add the given Post object to the feed. */
  _displayPost(post) {
    if (!(post instanceof Post)) throw new Error("displayPost wasn't passed a Post object");

    let elem = document.querySelector("#templatePost").cloneNode(true);
    elem.id = "";


    elem.querySelector(".name").textContent = post.user.name;
    elem.querySelector(".userid").textContent = post.user.id;
    elem.querySelector(".time").textContent = post.time.toLocaleString();
    elem.querySelector(".text").textContent = post.text;

    document.querySelector("#feed").append(elem);
  }

  async _loadProfile() {
    document.querySelector("#welcome").classList.add("hidden");
    document.querySelector("#main").classList.remove("hidden");
    document.querySelector("#idContainer").textContent = this._user.id;
    document.querySelector("#feed").textContent = "";
  }
}
