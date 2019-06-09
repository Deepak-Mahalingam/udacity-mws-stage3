if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('../sw.js')
        .then(registration => navigator.serviceWorker.ready)
        .then(registration => { // register sync
            document.getElementById('reviewForm').addEventListener('click', () => {
                const id = document.getElementById("restnames").value;
                const name = document.getElementById("usrname").value;
                const rating = document.getElementById("usrrating").value;
                const comment = document.getElementById("usrcomment").value;

                const usrReview = {
                    "restaurant_id": id,
                    "name": name,
                    "rating": rating,
                    "comments": comment
                }
                console.log("Review is ", usrReview);
                DBHelper.storeReview(usrReview, "review");

                registration.sync.register('review').then(() => {
                    console.log('Sync registered');
                });
            });
        });
} else {
    document.getElementById('requestButton').addEventListener('click', () => {
        console.log('Fallback to fetch the image as usual');
    });
}

// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('../sw.js',{scope: '/'})
//     .then(registration => navigator.serviceWorker.ready)
//     .then(function(registration) {
//             document.getElementById('reviewForm').addEventListener('click', (event) => {
//                 console.log("Review clicked!")
//                 const id = document.getElementById("resid").value;
//                 const name = document.getElementById("usrname").value;
//                 const rating = document.getElementById("usrrating").value;
//                 const comment = document.getElementById("usrcomment").value;

//                 const usrReview = {
//                   "restaurant_id": id,
//                   "name": name,
//                   "rating": rating,
//                   "comments": comment
//                 }
//                 console.log("Review is ",usrReview);
//                 DBHelper.storeJSON(usrReview,"review");

//                 navigator.serviceWorker.controller.postMessage("A new Message sent");

//                 if(registration.sync) {
//                     console.log("Starting to sync")
//                     registration.sync.register('review')
//                     .catch(function(err) {
//                         console.log(err)
//                         return err;
//                     })
//                 }
//             })
//         })
//         .catch(err=>console.log(err));

// }
