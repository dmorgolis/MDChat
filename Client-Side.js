window.onload = function () {
const startImageInput = document.getElementById('start-image-input');
startImageInput.addEventListener('change', displayProfilePicture);
}

function displayProfilePicture() {
const profilePicture = document.getElementById('profile-picture');
const startImageInput = document.getElementById('start-image-input');

const imageFile = startImageInput.files[0];
if (imageFile) {
    const reader = new FileReader();
    reader.onload = function (e) {
        profilePicture.src = e.target.result;
    };
    reader.readAsDataURL(imageFile);
}
}

function startChat() {
// הפונקציה כמו שהיא, כדי להציג את שאר פרטי המשתמש
}

// הוספת משתנה לאחסון המשתמשים המחוברים
let connectedUsers = [];

function updateUserList() {
// הצגת חלון נוסף עם רשימת המשתמשים המחוברים
Swal.fire({
title: 'Connected Users',
html: connectedUsers.join('<br>'), // המרת המערך למחרוזת עם תגית <br> בין כל שם לשם
icon: 'info',
confirmButtonText: 'OK'
});
}

function startChat() {
const startNameInput = document.getElementById('start-name');
const startImageInput = document.getElementById('start-image-input');
const profilePictureHeader = document.getElementById('profile-picture-header');
const userNameHeader = document.getElementById('user-name-header');
const startPage = document.getElementById('start-page');
const chatContainer = document.getElementById('chat-container');

const name = startNameInput.value.trim();
if (name !== '') {
// Set the user name in the chat header
userNameHeader.textContent = name;

// Set the user name globally for further use
new_user = name;

// Add the user to the connected users list
connectedUsers.push(name);

// Update the user list
updateUserList();

// Set the profile picture in the chat header
const imageFile = startImageInput.files[0];
if (imageFile) {
const reader = new FileReader();
reader.onload = function (e) {
    profilePictureHeader.src = e.target.result;
};
reader.readAsDataURL(imageFile);
}

// Hide the start page and show the chat container
startPage.style.display = 'none';
chatContainer.style.display = 'flex';
}
}

function logout() {
// Remove the user from the connected users list
const index = connectedUsers.indexOf(new_user);
if (index !== -1) {
connectedUsers.splice(index, 1);
}

// Update the user list
updateUserList();

// Clear the user name and profile picture
new_user = null;
const profilePictureHeader = document.getElementById('profile-picture-header');
profilePictureHeader.src = '';

// Show the start page and hide the chat container
const startPage = document.getElementById('start-page');
const chatContainer = document.getElementById('chat-container');
startPage.style.display = 'flex';
chatContainer.style.display = 'none';
}


function sendMessage() {
const messageInput = document.getElementById('message-input');
const messageText = messageInput.value.trim();
if (messageText !== '') {
 // Implement your logic to send messages
postMessage(new_user, messageText);
messageInput.value = ''; // Clear the message input
}
}

function getMessages() {
fetch("https://mdre.onrender.com/chats")
    .then(res => res.json())
    .then(data => {
        messages = data;
        displayMessages();
    });
}

function displayMessages() {
const postsList = document.getElementById('chat-messages');
postsList.innerHTML = "";

for (let i = 0; i < messages.length; i++) {
const messageDiv = document.createElement('div');
messageDiv.classList.add('message');

if (messages[i].user === new_user) {
messageDiv.classList.add('sent');
messageDiv.style.backgroundColor = '#73c264';
messageDiv.style.color = '#000';
messageDiv.style.alignSelf = 'flex-start';
} else {
messageDiv.classList.add('received');
messageDiv.style.backgroundColor = '#f0f0f0';
messageDiv.style.color = '#000';
messageDiv.style.alignSelf = 'flex-end';
}

messageDiv.innerHTML = `
<div class="message-info">
<div class="user-name">${messages[i].user}</div>
<div class="user-details">Joined: ${messages[i].joined}</div>
</div>
<div class="message-text">${messages[i].text}</div><br>
<div class="message-actions btn-toolbar" role="toolbar">
<div class="btn-group mr-2" role="group">
<button type="button" class="btn btn-primary" onclick="updateMessage(${i})">Update</button>
<button type="button" class="btn btn-danger" onclick="deleteMessage(${i})">Delete</button>
</div>
<div class="message-info">
<div class="message-time">${messages[i].time}</div>
</div>
</div>
`;

postsList.insertAdjacentElement('afterbegin', messageDiv);  // הוספת האלמנט לתחילת הרשימה
}
}


function postMessage(new_user, new_text) {
const new_time = time_now();
fetch("https://mdre.onrender.com/chats", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        user: new_user,
        text: new_text,
        time: new_time
    })
}).then(response => {
    if (!response.ok) {
        console.error(response);
        alert('Failure');
    } else {
        getMessages();
    }
});
}

async function updateMessage(messageIndex) {
// הוספת בדיקה האם המשתמש הוא באמת המשתמש ששלח את ההודעה
if (messages[messageIndex].user === new_user) {
const { value: new_text } = await Swal.fire({
title: 'Update Message',
input: 'textarea',
inputLabel: 'Enter the new message:',
inputValue: messages[messageIndex].text,
showCancelButton: true
});

// אם המשתמש לא ביטל והזין טקסט חדש, בצע עדכון
if (new_text !== null && new_text.trim() !== '') {
const url = `https://mdre.onrender.com/chats/${messages[messageIndex].id}`;
fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        text: new_text.trim(),
    })
}).then(response => {
    if (!response.ok) {
        console.error(response);
        Swal.fire('Update Failed', 'An error occurred while updating the message.', 'error');
    } else {
        messages[messageIndex].text = new_text.trim();
        displayMessages();
    }
});
}
} else {
Swal.fire('Unauthorized', 'You cannot update this message.', 'warning');
}
}

async function deleteMessage(messageIndex) {
const url = `https://mdre.onrender.com/chats/${messages[messageIndex].id}`;

if (messages[messageIndex].user === new_user) {
const swalWithBootstrapButtons = Swal.mixin({
customClass: {
    confirmButton: 'btn btn-success',
    cancelButton: 'btn btn-danger'
},
buttonsStyling: false
});

swalWithBootstrapButtons.fire({
title: 'Are you sure?',
text: "You won't be able to revert this!",
icon: 'warning',
showCancelButton: true,
confirmButtonText: 'Yes, delete it!',
cancelButtonText: 'No, cancel!',
reverseButtons: true
}).then(async (result) => {
if (result.isConfirmed) {
    const response = await fetch(url, { method: 'DELETE' });
    if (response.ok) {
        messages.splice(messageIndex, 1);
        displayMessages();
        swalWithBootstrapButtons.fire('Deleted!', 'Your message has been deleted.', 'success');
    } else {
        console.error(response);
        swalWithBootstrapButtons.fire('Delete Failed', 'An error occurred while deleting the message.', 'error');
    }
} else if (result.dismiss === Swal.DismissReason.cancel) {
    swalWithBootstrapButtons.fire('Cancelled', 'Your message is safe :)', 'error');
}
});
} else {
Swal.fire('Unauthorized', 'You cannot delete this message.', 'warning');
}
}


function time_now() {
const now = new Date();
return now.toLocaleString();
}

const messageForm = document.getElementById('message-form');
messageForm.addEventListener('submit', function (event) {
event.preventDefault();
const messageInput = document.getElementById('message-input');
const messageText = messageInput.value;
if (messageText.trim() !== '') {
    postMessage(new_user, messageText);
    messageInput.value = '';
}
});

intervalId = setInterval(getMessages, 500)
