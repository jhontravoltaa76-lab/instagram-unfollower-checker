// DOM Elements
const themeToggleBtn = document.getElementById('theme-toggle');
const moonIcon = document.getElementById('moon-icon');
const sunIcon = document.getElementById('sun-icon');

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const statusFollowers = document.getElementById('status-followers');
const statusFollowing = document.getElementById('status-following');
const analyzeBtn = document.getElementById('analyze-btn');

const uploadSection = document.getElementById('upload-section');
const dashboardSection = document.getElementById('dashboard-section');

// Metrics
const countFollowers = document.getElementById('count-followers');
const countFollowing = document.getElementById('count-following');
const countUnfollowers = document.getElementById('count-unfollowers');
const countFans = document.getElementById('count-fans');
const countMutuals = document.getElementById('count-mutuals');

// Table and Search
const tabBtns = document.querySelectorAll('.tab-btn');
const tableBody = document.getElementById('table-body');
const searchInput = document.getElementById('search-input');
const exportBtn = document.getElementById('export-btn');
const emptyState = document.getElementById('empty-state');

// State Variables
let followersData = null;
let followingData = null;
let myChart = null;

let analysisResult = {
    unfollowers: [],
    fans: [],
    mutuals: []
};
let currentTab = 'unfollowers'; // Default tab

// --- Theme Management ---
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    if (theme === 'dark') {
        moonIcon.style.display = 'none';
        sunIcon.style.display = 'block';
    } else {
        moonIcon.style.display = 'block';
        sunIcon.style.display = 'none';
    }
}

themeToggleBtn.addEventListener('click', toggleTheme);
initTheme();


// --- File Handling ---
dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFiles(e.target.files);
    }
});

function handleFiles(files) {
    for (let file of files) {
        if (file.name.includes('followers')) {
            readFile(file, 'followers');
        } else if (file.name.includes('following')) {
            readFile(file, 'following');
        }
    }
}

function readFile(file, type) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const json = JSON.parse(e.target.result);
            if (type === 'followers') {
                followersData = json;
                statusFollowers.querySelector('.indicator').classList.remove('red');
                statusFollowers.querySelector('.indicator').classList.add('green');
            } else {
                followingData = json;
                statusFollowing.querySelector('.indicator').classList.remove('red');
                statusFollowing.querySelector('.indicator').classList.add('green');
            }
            checkReadyState();
        } catch (error) {
            alert(`Error parsing ${file.name}. Pastikan itu file JSON yang valid.`);
        }
    };
    reader.readAsText(file);
}

function checkReadyState() {
    if (followersData && followingData) {
        analyzeBtn.disabled = false;
    }
}

// --- Data Extraction & Analysis ---
function extractList(json) {
    if (Array.isArray(json)) return json;
    
    if (json && typeof json === 'object') {
        if (json.relationships_following && Array.isArray(json.relationships_following)) {
            return json.relationships_following;
        }
        if (json.relationships_follower && Array.isArray(json.relationships_follower)) {
            return json.relationships_follower;
        }
        if (json.followers && Array.isArray(json.followers)) {
            return json.followers;
        }
        if (json.following && Array.isArray(json.following)) {
            return json.following;
        }
    }
    return null;
}

function getUsername(item) {
    if (item && item.string_list_data && Array.isArray(item.string_list_data) && item.string_list_data.length > 0) {
        if (item.string_list_data[0].value) {
            return item.string_list_data[0].value;
        }
    }
    if (item && item.title) {
        return item.title;
    }
    return null;
}

function parseUsernames(data) {
    const list = extractList(data);
    if (!list) return null; // Format tidak valid/tidak dikenali
    
    const usernames = new Set();
    list.forEach(item => {
        const username = getUsername(item);
        if (username && typeof username === 'string') {
            usernames.add(username.toLowerCase());
        }
    });
    
    return usernames;
}

analyzeBtn.addEventListener('click', () => {
    const followers = parseUsernames(followersData);
    const following = parseUsernames(followingData);
    
    if(!followers) {
        alert("Gagal membaca struktur file Followers. Pastikan file yang diunggah berformat ekspor resmi Instagram.");
        return;
    }
    
    if(!following) {
        alert("Gagal membaca struktur file Following. Pastikan file yang diunggah berformat ekspor resmi Instagram.");
        return;
    }
    
    if(followers.size === 0 && following.size === 0) {
        alert("File berhasil dibaca, namun tidak ada username yang ditemukan.");
        return;
    }

    const followersArray = Array.from(followers);
    const followingArray = Array.from(following);

    // Logic for mutuals, unfollowers, fans (Case-insensitive check is already handled since Set contains lowercase)
    const mutuals = followingArray.filter(user => followers.has(user));
    const unfollowers = followingArray.filter(user => !followers.has(user)); // We follow, they don't follow back
    const fans = followersArray.filter(user => !following.has(user)); // They follow, we don't follow back

    analysisResult.mutuals = mutuals.sort();
    analysisResult.unfollowers = unfollowers.sort();
    analysisResult.fans = fans.sort();

    // Update UI Metrics
    countFollowers.textContent = followers.size;
    countFollowing.textContent = following.size;
    countUnfollowers.textContent = unfollowers.length;
    countFans.textContent = fans.length;
    countMutuals.textContent = mutuals.length;

    // Switch view
    uploadSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');

    initChart(unfollowers.length, fans.length, mutuals.length);
    renderTable();
});

// --- Chart rendering ---
function initChart(unfollowers, fans, mutuals) {
    const ctx = document.getElementById('analysisChart').getContext('2d');
    
    if(myChart) myChart.destroy();
    
    const rootStyle = getComputedStyle(document.documentElement);
    const colorUnfollowers = rootStyle.getPropertyValue('--accent-unfollowers').trim();
    const colorFans = rootStyle.getPropertyValue('--accent-fans').trim();
    const colorMutuals = rootStyle.getPropertyValue('--accent-mutuals').trim();
    const textColor = rootStyle.getPropertyValue('--text-primary').trim();

    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Unfollowers', 'Fans', 'Mutuals'],
            datasets: [{
                data: [unfollowers, fans, mutuals],
                backgroundColor: [colorUnfollowers, colorFans, colorMutuals],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: textColor, font: { family: 'Outfit' } }
                }
            },
            cutout: '70%'
        }
    });
}

// --- Table and Tabs ---
tabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const targetBtn = e.currentTarget;
        tabBtns.forEach(b => b.classList.remove('active'));
        targetBtn.classList.add('active');
        currentTab = targetBtn.getAttribute('data-tab');
        renderTable();
    });
});

searchInput.addEventListener('input', renderTable);

function renderTable() {
    const query = searchInput.value.toLowerCase().trim();
    const dataList = analysisResult[currentTab] || [];
    
    const filteredData = dataList.filter(user => {
        if (!user) return false;
        return String(user).toLowerCase().includes(query);
    });
    
    tableBody.innerHTML = '';
    
    if (filteredData.length === 0) {
        tableBody.parentElement.style.display = 'none';
        emptyState.classList.remove('hidden');
        return;
    }
    
    tableBody.parentElement.style.display = 'table';
    emptyState.classList.add('hidden');

    const statusMap = {
        'unfollowers': { label: 'Not Following Back', class: 'unfollower' },
        'fans': { label: 'Fan (You don\'t follow)', class: 'fan' },
        'mutuals': { label: 'Mutual', class: 'mutual' }
    };
    
    const statusInfo = statusMap[currentTab];

    filteredData.forEach((username, index) => {
        const tr = document.createElement('tr');
        
        const tdNo = document.createElement('td');
        tdNo.textContent = index + 1;
        
        const safeUsername = String(username);
        
        const tdUser = document.createElement('td');
        tdUser.textContent = safeUsername;
        
        const tdLink = document.createElement('td');
        const a = document.createElement('a');
        a.href = `https://instagram.com/${encodeURIComponent(safeUsername)}`;
        a.target = '_blank';
        a.className = 'profile-link';
        a.textContent = `@${safeUsername}`;
        tdLink.appendChild(a);
        
        const tdStatus = document.createElement('td');
        const span = document.createElement('span');
        span.className = `status-badge ${statusInfo.class}`;
        span.textContent = statusInfo.label;
        tdStatus.appendChild(span);
        
        tr.appendChild(tdNo);
        tr.appendChild(tdUser);
        tr.appendChild(tdLink);
        tr.appendChild(tdStatus);
        
        tableBody.appendChild(tr);
    });
}

// --- Export CSV ---
exportBtn.addEventListener('click', () => {
    const dataList = analysisResult[currentTab] || [];
    if(dataList.length === 0) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "No,Username,Profil URL,Status\n";
    
    const statusMap = {
        'unfollowers': 'Not Following Back',
        'fans': 'Fan',
        'mutuals': 'Mutual'
    };

    dataList.forEach((username, index) => {
        const row = [
            index + 1,
            username,
            `https://instagram.com/${username}`,
            statusMap[currentTab]
        ];
        csvContent += row.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `instagram_${currentTab}_export.csv`);
    document.body.appendChild(link);
    
    link.click();
    document.body.removeChild(link);
});
