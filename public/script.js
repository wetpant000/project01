const bookBtn = document.querySelectorAll('.book-btn');
const serviceBtn = document.querySelectorAll('.services-btn');

// Select the form and the submit button correctly
const form = document.getElementById('booking-form');
const submitBtn = document.getElementById('submit-btn');


//when "book consultation" button is clicked, scroll to form
bookBtn.forEach(btn => {
    btn.addEventListener('click', () =>{
        const bookSection = document.querySelector('.book-consultation');
        bookSection.scrollIntoView({behavior: 'smooth'});
   });
});


//when "our services" button is clicked, scroll to services section
function exploreServices() {
    document.getElementById('services-consultation').scrollIntoView({
        behavior: 'smooth'
    });

}

//when "submit" button is clicked, show alert message
// Attach submit handler: prevent reload, provide feedback, and reset form
if (form) {
    form.addEventListener('submit', async function (e) {
        e.preventDefault(); // stop default page reload

        // disable the button and show feedback
        if (submitBtn) {
            submitBtn.classList.add('submitted');
            submitBtn.style.backgroundColor = "green";
            submitBtn.style.color = "black";
            submitBtn.textContent = 'Submitting...';
            submitBtn.disabled = true;
        }

        // collect form data
        const formData = Object.fromEntries(new FormData(form));

        try {
            // send to backend (server.js)
            const res = await fetch("http://localhost:5000/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            
            if (res.ok) {
                alert("Form submitted successfully!");
                console.log("Server response:", data);

                // reset UI
                form.reset();
                submitBtn.textContent = "Submitted";
            } else {
                alert("Something went wrong: " + (data.error || "Unknown error"));
                console.error(data);
                submitBtn.textContent = "Try Again";
            }
        } catch (err) {
            console.error("Network or server error:", err);
            alert("Could not reach server. Please try again later.");
            submitBtn.textContent = "Retry";
        } finally {
            submitBtn.disabled = false;
            submitBtn.style.backgroundColor = "";
            submitBtn.style.color = "";
            submitBtn.classList.remove('submitted');
        }
    });
} else {
    console.warn('Booking form (#booking-form) not found in DOM.');
}

    
