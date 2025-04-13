const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const loginSection = document.getElementById('login-section');
const dashboard = document.getElementById('dashboard');
const doctorLoginBtn = document.getElementById('doctor-login-btn');
const receptionistLoginBtn = document.getElementById('receptionist-login-btn');
const loginForm = document.getElementById('login-form');
const dashboardTitle = document.getElementById('dashboard-title');
const patientFormCard = document.getElementById('patient-form-card');
const closePatientForm = document.getElementById('close-patient-form');
const patientForm = document.getElementById('patient-form');

let currentUser = null;
let userRole = null;

document.addEventListener('DOMContentLoaded', function() {
    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            checkUserRole(user.uid);
        } else {
            showLoginSection();
        }
    });

    doctorLoginBtn.addEventListener('click', () => {
        doctorLoginBtn.classList.add('active');
        receptionistLoginBtn.classList.remove('active');
    });

    receptionistLoginBtn.addEventListener('click', () => {
        receptionistLoginBtn.classList.add('active');
        doctorLoginBtn.classList.remove('active');
    });

    loginForm.addEventListener('submit', handleLogin);
    closePatientForm.addEventListener('click', () => {
        patientFormCard.classList.add('d-none');
    });

    patientForm.addEventListener('submit', handlePatientRegistration);
});

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const isDoctor = doctorLoginBtn.classList.contains('active');

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            currentUser = userCredential.user;
            userRole = isDoctor ? 'doctor' : 'receptionist';
            showDashboard();
            loadDashboardData();
        })
        .catch((error) => {
            alert(error.message);
            console.error("Login error:", error);
        });
}

function checkUserRole(uid) {
    db.collection('users').doc(uid).get()
        .then(doc => {
            if (doc.exists) {
                userRole = doc.data().role;
                showDashboard();
                loadDashboardData();
            } else {
                auth.signOut();
            }
        })
        .catch(error => {
            console.error("Error getting user role:", error);
            auth.signOut();
        });
}

function showLoginSection() {
    loginSection.classList.remove('d-none');
    dashboard.classList.add('d-none');
    currentUser = null;
    userRole = null;
}

function showDashboard() {
    loginSection.classList.add('d-none');
    dashboard.classList.remove('d-none');
    
    if (userRole === 'doctor') {
        dashboardTitle.textContent = 'Doctor Dashboard';
    } else {
        dashboardTitle.textContent = 'Receptionist Dashboard';
    }
}

function loadDashboardData() {
    loadStats();
    loadRecentPatients();
}

function loadStats() {
    document.getElementById('today-appointments').textContent = '12';
    document.getElementById('total-patients').textContent = '245';
    document.getElementById('pending-bills').textContent = '8';
    document.getElementById('available-tokens').textContent = '15';
}

function loadRecentPatients() {
    const recentPatients = [
        { token: 'T-1024', name: 'John Doe', date: '2023-06-15', status: 'completed' },
        { token: 'T-1025', name: 'Jane Smith', date: '2023-06-15', status: 'waiting' },
        { token: 'T-1026', name: 'Robert Johnson', date: '2023-06-14', status: 'completed' },
        { token: 'T-1027', name: 'Emily Davis', date: '2023-06-14', status: 'cancelled' },
        { token: 'T-1028', name: 'Michael Wilson', date: '2023-06-13', status: 'completed' }
    ];
    
    const tbody = document.getElementById('recent-patients');
    tbody.innerHTML = '';
    
    recentPatients.forEach(patient => {
        const row = document.createElement('tr');
        row.className = 'new-element';
        
        const formattedDate = new Date(patient.date).toLocaleDateString();
        
        let statusBadge = '';
        if (patient.status === 'completed') {
            statusBadge = '<span class="badge bg-completed">Completed</span>';
        } else if (patient.status === 'waiting') {
            statusBadge = '<span class="badge bg-waiting">Waiting</span>';
        } else {
            statusBadge = '<span class="badge bg-cancelled">Cancelled</span>';
        }
        
        row.innerHTML = `
            <td>${patient.token}</td>
            <td>${patient.name}</td>
            <td>${formattedDate}</td>
            <td>${statusBadge}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-secondary">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

function handlePatientRegistration(e) {
    e.preventDefault();
    
    const patientData = {
        name: document.getElementById('patient-name').value,
        phone: document.getElementById('patient-phone').value,
        email: document.getElementById('patient-email').value,
        dob: document.getElementById('patient-dob').value,
        gender: document.getElementById('patient-gender').value,
        bloodGroup: document.getElementById('patient-blood').value,
        address: document.getElementById('patient-address').value,
        createdAt: new Date().toISOString()
    };
    
    const tokenNumber = 'T-' + Math.floor(1000 + Math.random() * 9000);
    
    db.collection('patients').add({
        ...patientData,
        token: tokenNumber,
        status: 'waiting'
    })
    .then(() => {
        alert(`Patient registered successfully! Token: ${tokenNumber}`);
        patientForm.reset();
        patientFormCard.classList.add('d-none');
        loadRecentPatients();
        loadStats();
    })
    .catch(error => {
        alert('Error registering patient: ' + error.message);
        console.error("Error adding patient:", error);
    });
}

function logout() {
    auth.signOut()
        .then(() => {
            showLoginSection();
        })
        .catch(error => {
            console.error("Logout error:", error);
        });
}