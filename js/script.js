document.getElementById('head').addEventListener('click', function(event) {
    event.preventDefault(); // prevent the default action (page scroll to the id)
    document.getElementById('welcome-message').classList.remove('hidden');
    document.getElementById('login').classList.add('hidden');
    document.getElementById('register').classList.add('hidden');
    document.getElementsByClassName("container")[0].classList.add('hidden');
    });

document.getElementById('login-link').addEventListener('click', function(event) {
event.preventDefault(); // prevent the default action (page scroll to the id)

document.getElementById('welcome-message').classList.add('hidden');
document.getElementById('register').classList.add('hidden');
document.getElementById('login').classList.remove('hidden');
document.getElementsByClassName("container")[0].classList.remove('hidden');
});

document.getElementById('register-link').addEventListener('click', function(event) {
event.preventDefault(); // prevent the default action (page scroll to the id)
document.getElementById('welcome-message').classList.add('hidden');
document.getElementById('login').classList.add('hidden');
document.getElementById('register').classList.remove('hidden');
document.getElementsByClassName("container")[0].classList.remove('hidden');
});

document.querySelectorAll('.toggle-button').forEach(button => {
  button.addEventListener('click', () => {
    const targetId = button.getAttribute('data-target');
    const targetElement = document.getElementById(targetId);

    // Cek apakah konten sudah aktif
    if (targetElement.classList.contains('active')) {
      // Jika aktif, sembunyikan konten
      targetElement.classList.remove('active');
    } else {
      // Menyembunyikan semua konten terlebih dahulu
      document.querySelectorAll('.content').forEach(content => {
        content.classList.remove('active');
      });

      // Menampilkan konten yang sesuai dengan tombol yang ditekan
      targetElement.classList.add('active');
    }
  });
});

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


// For Login
const loginForm = document.getElementById("login-form");

loginForm.addEventListener("submit", (e) => {
e.preventDefault();

const email = loginForm["login-email"].value;
const passphrase = loginForm["login-passphrase"].value;
var loginButton = document.getElementById('login-button');
  loginButton.innerText = 'Logging in...';
  loginButton.style.cursor = 'wait';
auth
.signInWithEmailAndPassword(email, passphrase)
.then((userCredential) => {
  const user = userCredential.user;
  onAuthSuccess(user);
  handleLoginSuccess();
  console.log("Login Successful");
  resetLoginButton();
})
.catch((error) => {
    const errorMessage = handleErrorCode(error.code);
    alert(errorMessage);
    console.log("Login Unsuccessful");
    resetLoginButton();
    
    });
});

// For Register
const registerForm = document.getElementById("register-form");

registerForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = registerForm["register-name"].value;
    const email = registerForm["register-email"].value;
    const passphrase = registerForm["register-passphrase"].value;
    const cnf_passphrase = registerForm["register-confirm-passphrase"].value;

    var registerButton = document.getElementById('register-button');
    registerButton.innerText = 'Registering in...';
    registerButton.style.cursor = 'wait';

    // Check if passphrases match
    if(passphrase === cnf_passphrase) {
        auth.createUserWithEmailAndPassword(email, passphrase)
            .then((userCredential) => {
                const user = userCredential.user;
                user.updateProfile({
                    displayName: name
                  });
                db.ref("users").child(user.uid).set({
                    name: name,
                    email: email,
                    passphrase: passphrase
                });

                alert("Registration successful!");
                resetRegisterButton();
                registerForm.reset();
            })
            .catch((error) => {
                const errorMessage = handleErrorCode(error.code);
                alert(errorMessage);
                resetRegisterButton();
            });
        } else {
            alert("Passphrases do not match. Please try again.");
            resetRegisterButton();
    }
});


// Function to handle login success (replace with your logic)
function handleLoginSuccess() {
    // Redirect to another page, display success message, etc.
    console.log("Redirecting to Notes page...");
    // window.location.href = "notes.html";
}

// Function to handle error codes (improve based on specific needs)
function handleErrorCode(errorCode) {
switch (errorCode) {
    case 'auth/wrong-password':
    return 'Incorrect email or password.';
    case 'auth/internal-error':
    return 'Incorrect email or password.';
    case 'auth/user-not-found':
    return 'User not found.';
    case 'auth/email-already-in-use':
    return 'Email already in use.';
    case 'auth/weak-password':
    return 'Password is too weak.';
    case 'auth/network-request-failed':
    return 'A network error has occurred, check your internet connection.';
    default:
    return ('An error occured. Please try again.');
}
}

function onAuthSuccess(user) {
    window.userId = user.uid;
    window.userName = user.displayName;
    console.log("User : ",user.displayName);
    
    window.location.href = 'notes.html';
  }

  function resetRegisterButton() {
    document.getElementById("register-button").innerText = "Register";
    document.getElementById("register-button").style.cursor = "pointer";
  }

  function resetLoginButton() {
    document.getElementById("login-button").innerText = "Login";
    document.getElementById("login-button").style.cursor = "pointer";
  }