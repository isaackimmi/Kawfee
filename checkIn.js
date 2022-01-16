const firebaseConfig = {
  apiKey: "AIzaSyAsQb6h1-3QAU3nurRL7hkmhRqdMv-vd74",
  authDomain: "kawfee-eab15.firebaseapp.com",
  projectId: "kawfee-eab15",
  storageBucket: "kawfee-eab15.appspot.com",
  messagingSenderId: "308251858864",
  appId: "1:308251858864:web:da07b739cd402c25e3a875",
  measurementId: "G-QWT5MP0KCT",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const auth = firebase.auth();

const checkInPage = document.getElementById("check-in-main-page");

const kawfeeId = localStorage.getItem("checkInId");

var userLocation;
var userLatitude;
var userLongitude;
var distanceToCafe;

var kawfeeName = document.getElementById("cafe-chosen");
const checkInBtn = document.getElementById("check-in-btn");
const checkOutBtn = document.getElementById("check-out-btn");
checkOutBtn.style.display = "none";
const kawfeeAddress = document.getElementById("check-in-address");
var kawfeeLatitude = localStorage.getItem("latitude");
var kawfeeLongitude = localStorage.getItem("longitude");
const small = document.createElement("small");
small.innerHTML = kawfeeId;
kawfeeAddress.appendChild(small);

var numPeople = document.getElementById("number-of-checked-in");

async function renderInfo() {
  try {
    const kawfeeRef = await db.collection("kawfees").doc(kawfeeId);

    if (distanceToCafe == undefined) {
      checkInBtn.disabled = true;
    }

    kawfeeRef.onSnapshot((doc) => {
      kawfeeName.innerHTML = doc.data().name;
      numPeople.innerHTML = doc.data().nPeople + " people are checked in";
    });
  } catch (error) {
    console.log(error);
  }
}

calculateUserLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(saveUserLocation);
  } else {
    alert("Geolocation is not supported by this browser.");
  }
};

saveUserLocation = (position) => {
  userLatitude = position.coords.latitude;
  userLongitude = position.coords.longitude;

  //   console.log(userLatitude);
  //   console.log(userLongitude);

  calculateDistanceToCafe();
};

calculateDistanceToCafe = () => {
  userLocation = new google.maps.LatLng(userLatitude, userLongitude);
  const cafeLocation = new google.maps.LatLng(kawfeeLatitude, kawfeeLongitude);
  distanceToCafe = google.maps.geometry.spherical.computeDistanceBetween(
    userLocation,
    cafeLocation
  );

  if (distanceToCafe != undefined) {
    checkInBtn.disabled = false;
  }
};

calculateUserLocation();
renderInfo();

async function kawfeeCheckIn() {
  try {
    if (distanceToCafe <= 0.01) {
      await db
        .collection("kawfees")
        .doc(kawfeeId)
        .update({
          nPeople: firebase.firestore.FieldValue.increment(1),
        });
      checkInBtn.style.display = "none";
      checkOutBtn.style.display = "inline";
      alert(
        "You're Checked In! Please don't forget to check out when you leave."
      );
    } else {
      alert(
        "You're not there yet! (You have to be within 10 meters of the cafe)"
      );
    }
  } catch (error) {
    console.log(error);
  }
}

async function kawfeeCheckOut() {
  try {
    await db
      .collection("kawfees")
      .doc(kawfeeId)
      .update({
        nPeople: firebase.firestore.FieldValue.increment(-1),
      });
    alert("See you later!");
  } catch (error) {
    console.log(error);
  }
  window.location.href = "/index.html";
}

window.setInterval(() => {
  calculateUserLocation();
  if (distanceToCafe > 0.025) {
    kawfeeCheckOut();
  }
}, 300000);
