try {
  var cacheName = 'sw_v1';
  var cacheFiles = [
    '/',
    'index.html',
    'img/1.jpg',
    'img/2.jpg',
    'img/3.jpg',
    'img/4.jpg',
    'img/5.jpg',
    'img/6.jpg',
    'img/7.jpg',
    'img/8.jpg',
    'img/9.jpg',
    'img/10.jpg',
    'js/dbhelper.js',
    'js/main.js',
    'js/restaurant_info.js',
    'js/registerService.js'
  ]



  self.addEventListener('install', event => {

    caches.open(cacheName)
      .then(function (cache) {
        console.log(cacheFiles);
        return cache.addAll(cacheFiles);
      })
      .catch((e) => console.log(e));

  })

  self.addEventListener('fetch', function(event) {
    event.respondWith(
      caches.open(cacheName).then(function(cache) {
        return cache.match(event.request).then(function(response) {
          var fetchPromise = fetch(event.request).then(function(networkResponse) {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          })
          return response || fetchPromise;
        })
      })
    );
  });


  self.addEventListener('activate', event => {
    console.log('Activating the service worker');
  });
}
catch (e) {
  console.log(e.stack);
}

self.addEventListener('sync', function (event) {
  console.log("Sync happened!")
  if (event.tag === 'review') {
    event.waitUntil(fetchReview());
  }
});

function fetchReview() {
  console.log("Saving a new review")
  var db;

  var openRequest = indexedDB.open("ResponsDB", 1);

  openRequest.onupgradeneeded = function (e) {
    var thisDB = e.target.result;

    if (!thisDB.objectStoreNames.contains("restaurant")) {
      thisDB.createObjectStore("restaurant");
    }
  }

  openRequest.onsuccess = function (e) {

    db = e.target.result;

    var transaction = db.transaction(["restaurant"], "readwrite");
    var store = transaction.objectStore("restaurant");

    var request = store.get(String("review"));
    var objectStore = transaction.objectStore("restaurant");


    request.onsuccess = function (e) {
      var usrReview = e.target.result;
      if (usrReview == undefined) {
        console.log("Retyring.....")
        const request = store.get(String("review"));
        request.onsuccess = function (e) {
          var usrr = e.target.value;
          console.log(usrr);
        }
      }

      console.log("The user review from IndexDB is ", usrReview);

      return fetch('http://localhost:1337/reviews/', {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usrReview)
      })
        .then(res => {
          console.log(res);
        })
    }
  }
}
