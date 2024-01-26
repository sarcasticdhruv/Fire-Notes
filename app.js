const firebaseConfig = require('./firebaseConfig');
  
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();

const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const noteForm = document.getElementById("note-form");
const notesContainer = document.getElementById("notes-container");
  
  // Show/hide containers
const showContainer = (containerId) => {
const containers = document.getElementsByClassName("container");
for (const container of containers) {
    container.style.display = "none";
}
document.getElementById(containerId).style.display = "block";
};
  
// Add a submit event listener to the login form
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Get the passphrase input value
  const email = loginForm["login-email"].value;
  const passphrase = loginForm["login-passphrase"].value;

  // Sign in the user with the passphrase
  auth.signInWithEmailAndPassword(email, passphrase)
    .then(() => {
      // If the sign-in is successful, open the home page
      document.getElementById("main-container").classList.add("hidden");
      document.getElementById("home-container").classList.remove("hidden");
      console.log("Succesful");
    })
    .catch((error) => {
      // If the sign-in is unsuccessful, prompt the wrong passphrase message
      alert("Wrong passphrase");
    });
});
  
  // Register
registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = registerForm.register_name.value;
    const email = registerForm.register_email.value;
    const passphrase = registerForm.register_passphrase.value;
    const confirmPassphrase = registerForm.register_confirm_passphrase.value;
  
    if (passphrase !== confirmPassphrase) {
      alert("Passphrases do not match");
      return;
    }
  
    auth
      .createUserWithEmailAndPassword(email, passphrase)
      .then((userCredential) => {
        const user = userCredential.user;
        db.ref("users/" + user.uid).set({
          name,
          email,
          notes: {},
        })
        .then(() => {
          alert("User registered successfully!");
          showContainer("home-container");
          loadNotes();
        })
        .catch((error) => {
          alert("Error registering user: " + error.message);
        });
      })
      .catch((error) => {
        alert("Error registering user: " + error.message);
      });
  });
  
  // Home
  auth.onAuthStateChanged((user) => {
    if (user) {
      showContainer("home-container");
      loadNotes();
    } else {
      showContainer("login-container");
    }
  });
  
  // Save note
  noteForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const content = noteForm.note_content.value;
    const user = auth.currentUser;
    const userId = user.uid;
    const userRef = db.ref("users/" + userId);
    const notesRef = userRef.child("notes");
    const newNoteRef = notesRef.push();
    newNoteRef.set(content);
    noteForm.note_content.value = "";
  });
  
  // Load notes
  const loadNotes = () => {
    const user = auth.currentUser;
    const userId = user.uid;
    const userRef = db.ref("users/" + userId);
    const notesRef = userRef.child("notes");
  
    notesRef.on("child_added", (snapshot) => {
      const note = snapshot.val();
      const noteElement = document.createElement("div");
      noteElement.classList.add("note");
      noteElement.textContent = note;
      const copyButton = document.createElement("button");
      copyButton.textContent = "Copy";
      copyButton.addEventListener("click", () => {
        navigator.clipboard.writeText(note);
      });
      noteElement.appendChild(copyButton);
      notesContainer.appendChild(noteElement);
    });
  };