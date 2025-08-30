// ⬇️ Replace with your Supabase Project URL + Public Anon Key
const SUPABASE_URL = "https:/https://ewcfuvlauupxtetqkedg.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3Y2Z1dmxhdXVweHRldHFrZWRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1MzM4ODIsImV4cCI6MjA3MjEwOTg4Mn0.LiEDvyp8EV6G5XPwneIvQnjcEdfc4uXWU6qZ-vbHnQ8";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// DOM Elements
const authSection = document.getElementById("auth-section");
const appSection = document.getElementById("app-section");
const signupBtn = document.getElementById("signup");
const loginBtn = document.getElementById("login");
const logoutBtn = document.getElementById("logout");
const createPostBtn = document.getElementById("create-post");
const feed = document.getElementById("feed");

// 🔹 Sign Up
signupBtn.onclick = async () => {
  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;
  let { error } = await supabase.auth.signUp({ email, password });
  if (error) alert(error.message);
  else alert("Signup successful, check email for confirmation!");
};

// 🔹 Login
loginBtn.onclick = async () => {
  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;
  let { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) alert(error.message);
  else {
    authSection.classList.add("hidden");
    appSection.classList.remove("hidden");
    loadPosts();
  }
};

// 🔹 Logout
logoutBtn.onclick = async () => {
  await supabase.auth.signOut();
  appSection.classList.add("hidden");
  authSection.classList.remove("hidden");
};

// 🔹 Create Post
createPostBtn.onclick = async () => {
  let content = document.getElementById("post-content").value;
  const user = (await supabase.auth.getUser()).data.user;
  if (!content) return;
  await supabase.from("posts").insert([{ user_id: user.id, content }]);
  document.getElementById("post-content").value = "";
  loadPosts();
};

// 🔹 Load Posts
async function loadPosts() {
  feed.innerHTML = "Loading...";
  let { data: posts } = await supabase
    .from("posts")
    .select("id, content, created_at, user_id")
    .order("created_at", { ascending: false });

  feed.innerHTML = "";
  posts.forEach(post => {
    let div = document.createElement("div");
    div.className = "post";
    div.innerHTML = `
      <p>${post.content}</p>
      <button onclick="likePost(${post.id})">👍 Like</button>
      <button onclick="commentPost(${post.id})">💬 Comment</button>
      <div id="comments-${post.id}"></div>
    `;
    feed.appendChild(div);
    loadComments(post.id);
  });
}

// 🔹 Like a Post
async function likePost(postId) {
  const user = (await supabase.auth.getUser()).data.user;
  await supabase.from("likes").insert([{ user_id: user.id, post_id: postId }]);
  alert("You liked this post!");
}

// 🔹 Comment on Post
async function commentPost(postId) {
  const text = prompt("Enter your comment:");
  const user = (await supabase.auth.getUser()).data.user;
  if (text) {
    await supabase.from("comments").insert([{ user_id: user.id, post_id: postId, content: text }]);
    loadComments(postId);
  }
}

// 🔹 Load Comments
async function loadComments(postId) {
  let { data: comments } = await supabase
    .from("comments")
    .select("content, created_at")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  const container = document.getElementById(`comments-${postId}`);
  container.innerHTML = "";
  comments.forEach(c => {
    let p = document.createElement("p");
    p.className = "comment";
    p.innerText = c.content;
    container.appendChild(p);
  });
}