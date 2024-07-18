const firebaseConfig = {
  apiKey: "Your API Key",
  authDomain: "Your Auth Domain",
  databaseURL: "Your Database URL",
  projectId: "Your Project ID",
  storageBucket: "Your Storage Bucket",
  messagingSenderId: "Your Messaging Sender ID",
  appId: "Your App ID"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

let inactivityTimer;

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    window.userId = user.uid;
    window.userName = user.displayName;
    resetTimer();
    console.log("User signed in.");
    fetchNotes();
    document.getElementById("navbar-username").textContent = window.userName;
    document.getElementById("signin-modal").style.display = "none";
    document.querySelector('main').style.filter = ""; // Remove blur from body
  } else {
    window.userId = null;
    window.userName = null;
    console.log("User signed out.");
    document.getElementById("navbar-username").textContent = "Guest";
    document.querySelector('main').style.filter = "blur(4px)"; // This line applies the blur effect
    document.getElementById("signin-modal").style.display = "flex"; // Show the modal
  }
});

// Redirect to index.html on button click
document.getElementById("signin-btn").addEventListener("click", function() {
  window.location.href = "index.html";
});

const logoutButton = document.getElementById("logout-button");
if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    resetTimer();
    logout();
  });
}

document.addEventListener("mousemove", resetTimer);
document.addEventListener("keypress", resetTimer);
document.addEventListener("touchstart", resetTimer);

document.getElementById("save-note-button").addEventListener("click", function () {
  const noNotesMessage = document.querySelector('.no-notes-message');
  if (noNotesMessage) {
    noNotesMessage.classList.remove('no-notes-message');
    noNotesMessage.textContent = '';
  }
  addNote();
});

document.getElementById("add-note-button").addEventListener("click", function () {
  const activeNote = document.getElementsByClassName("note active")[0];
  if (activeNote) {
    activeNote.classList.remove("active");
  }
  
  if (window.innerWidth <= 768) { // Check if the device is likely a mobile device
    document.getElementById('back').style.display = 'block';
    const funcNotes = document.querySelector('.FuncNotes');
    const viewNotes = document.querySelector('.ViewNotes');

    // Toggle display styles
    if (funcNotes && viewNotes) {
        funcNotes.style.display = 'none'; // Hide .FuncNotes
        viewNotes.style.display = 'block'; // Show .ViewNotes
    }
}
  clearExistingData(); // Clear existing data
  
});

const deleteButton = document.getElementById("delete-note-button");
deleteButton.addEventListener("click", () => {
  const activeNoteId = document.querySelector(".note.active").getAttribute("data-note-id");
  deleteNote(activeNoteId)
  if (confirm("Are you sure you want to delete this note?")) {
    deleteNote(activeNoteId)
      .catch((error) => {
        console.log("Error deleting note:", error);
        alert("Error deleting the note. Please try again.");
      });
  }
});


function resetTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(logout, 15 * 60 * 1000); // 15 minutes
}

function logout() {
  console.log("Logout function called.");
  firebase.auth().signOut().then(() => {
    console.log("Sign-out successful.");
    window.userId = null;
    window.location.href = "index.html";
  }).catch((error) => {
    console.log("Sign-out failed: " + error.message);
  });
}

function addNote() {
  const title = document.getElementById("note-title").value;
  const body = document.getElementById("note-body").value;

  if (title && body) {
    const user = firebase.auth().currentUser;
    const userId = user ? user.uid : "anonymous";

    const noteRef = firebase.database().ref(`users/${userId}/notes`).push();
    noteRef.set({
      title,
      body,
      createdAt: firebase.database.ServerValue.TIMESTAMP,
    });

    // Clear the textareas after adding the note
    document.getElementById("note-title").value = "";
    document.getElementById("note-body").value = "";
    
    alert("Note Added Successfully!!");
  } else {
    alert("Please enter a title and a note.");
  }
}


function fetchNotes() {
  const user = firebase.auth().currentUser;
  const userId = user ? user.uid : "anonymous";
  const notesRef = firebase.database().ref(`users/${userId}/notes`);
  notesRef.on("child_added", function (snapshot) {
    const note = snapshot.val();
    const noteId = snapshot.ref.key;
    addNoteToPage(note,noteId);
  });

    // Add this new block of code
    notesRef.on("value", (snapshot) => {
      const hasChildren = snapshot.numChildren();
  
      if (!hasChildren) {
        const notesDiv = document.getElementsByClassName("notes")[0];
        const noNotesMessage = document.createElement("p");
        noNotesMessage.className = "no-notes-message";
        noNotesMessage.textContent = "No existing notes...";
        notesDiv.appendChild(noNotesMessage);

      }
    });
}

function addNoteToPage(note,noteId) {
  const noteDiv = document.createElement("div");
  noteDiv.className = "note";
  noteDiv.innerText = note.title;
  noteDiv.setAttribute("data-note-id", noteId);

  noteDiv.addEventListener("click", function (event) {
    const currentActiveNote = document.getElementsByClassName("note active")[0]
    if (currentActiveNote) {
      currentActiveNote.classList.remove("active")
    }
    event.currentTarget.classList.add("active")
    displayNote(event.currentTarget.getAttribute("data-note-id"))
  })

  if (note.active) {
    noteDiv.classList.add("active")
  }

  const notesDiv = document.getElementsByClassName("notes")[0];
  if (notesDiv) {
    if (notesDiv.firstChild) {
      notesDiv.insertBefore(noteDiv, notesDiv.firstChild.nextSibling);
    } else {
      notesDiv.appendChild(noteDiv);
    }
    
  } else {
    console.error("Error: 'notesDiv' is undefined.");
  }

  noteDiv.addEventListener("click", function (event) {
    displayNote(event.currentTarget.getAttribute("data-note-id"));
  });
}

function displayNote(noteId) {
  const notesRef = firebase.database().ref('users/' + window.userId + '/notes')
  notesRef.once('value', (snapshot) => {
    const notes = snapshot.val()
    for (const key in notes) {
      if (notes.hasOwnProperty(key) && key === noteId) {
        // console.log("Working")
        originalNote = notes[key];
        const note = notes[key]
        const title = note.title
        const body = note.body
        const timestamp = new Date(note.createdAt).toLocaleString()
        document.getElementById('note-title').value = title;
        document.getElementById('note-body').value = body;
        document.getElementById('timestamp').innerText = `Created at: ${timestamp}`;
       	const noteDiv = document.querySelector(`[data-note-id="${noteId}"]`)
        if (noteDiv) {
          noteDiv.classList.add("active")
          
          if (window.innerWidth <= 768) { // Check if the device is likely a mobile device
            setTimeout(() => { // Add a delay
              const funcNotes = document.querySelector('.FuncNotes');
              const viewNotes = document.querySelector('.ViewNotes');
              document.getElementById('back').style.display = 'block';
          
              // Toggle display styles
              if (funcNotes && viewNotes) {
                  funcNotes.style.display = 'none'; // Hide .FuncNotes
                  viewNotes.style.display = 'block'; // Show .ViewNotes
              }
            }, 500); // Delay of 1000 milliseconds (1 second)
          }
          
        }
        
        break
        }
      }
    });
  }

function clearExistingData() {
  document.getElementById('note-title').value = '';
  document.getElementById('note-body').value = '';
  document.getElementById('timestamp').innerText = '';
}

function deleteNote(noteId) {
  const user = firebase.auth().currentUser
  const userId = user ? user.uid : "anonymous"
  const notesRef = firebase.database().ref(`users/${userId}/notes/${noteId}`)

  notesRef.remove()
    .then(() => {
      console.log("Note deleted successfully")
      removeNoteFromDisplay(noteId);
      clearExistingData();
    })
    .catch((error) => {
      console.log("Error deleting note:", error)
    })
}

function removeNoteFromDisplay(noteId) {
  const noteDiv = document.querySelector(`[data-note-id="${noteId}"]`)
  if (noteDiv) {
    noteDiv.remove()
  }
}

document.getElementById("back").addEventListener("click", function () {
  const funcNotes = document.querySelector('.FuncNotes');
  const viewNotes = document.querySelector('.ViewNotes');

  if (funcNotes && viewNotes) {
      funcNotes.style.display = 'block'; // Show .FuncNotes
      viewNotes.style.display = 'none'; // Hide .ViewNotes
  }
  document.getElementById('back').style.display = 'none';
});

