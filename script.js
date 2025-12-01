// Global Chart Instances
let myPieChart = null;
let myLineChart = null;

// Update Greeting in Real-time
function updateGreeting() {
    const name = document.getElementById('userName').value;
    const greetingElement = document.getElementById('greeting');
    if (name.trim() !== "") {
        greetingElement.innerText = `Esselamu Alejkum, ${name}!`;
    } else {
        greetingElement.innerText = "Esselamu Alejkum!";
    }
}

// Main Function to Generate Plan
function generatePlan() {
    // 1. Get Values
    const totalPages = parseInt(document.getElementById('totalPages').value);
    const pagesPerDay = parseFloat(document.getElementById('pagesPerDay').value);
    const daysPerWeek = parseInt(document.getElementById('daysPerWeek').value);
    const style = document.getElementById('planStyle').value;
    const name = document.getElementById('userName').value || "Hafiz";

    if (!totalPages || !pagesPerDay || !daysPerWeek) {
        alert("Ju lutem plotësoni të gjitha fushat numerike!");
        return;
    }

    // 2. Calculations
    const pagesPerWeek = pagesPerDay * daysPerWeek;
    const totalWeeks = Math.ceil(totalPages / pagesPerWeek);
    const totalMonths = (totalWeeks / 4.33).toFixed(1);
    
    // Calculate Completion Date
    const today = new Date();
    const daysToComplete = totalWeeks * 7; 
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + daysToComplete);
    const formattedDate = endDate.toLocaleDateString('sq-AL', { day: 'numeric', month: 'long', year: 'numeric' });

    // 3. Update Stats UI
    document.getElementById('totalDuration').innerText = `${totalWeeks} Javë (${totalMonths} Muaj)`;
    document.getElementById('completionDate').innerText = formattedDate;
    
    let intensity = "Normal";
    if (pagesPerDay >= 4) intensity = "I Lartë (Advanced)";
    if (pagesPerDay <= 1) intensity = "I Lehtë (Light)";
    document.getElementById('intensityLabel').innerText = intensity;

    // 4. Generate Table
    generateTable(totalWeeks, pagesPerWeek, totalPages, style);

    // 5. Generate Charts
    generateCharts(totalWeeks, totalPages, pagesPerDay, style);

    // 6. Show Results
    document.getElementById('results-area').classList.remove('hidden');
    
    // Scroll to results
    document.getElementById('results-area').scrollIntoView({ behavior: 'smooth' });
}

function generateTable(weeks, pagesPerWeek, totalPages, style) {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = "";
    
    let currentTotal = 0;
    
    for (let i = 1; i <= weeks; i++) {
        let startPage = currentTotal + 1;
        let endPage = currentTotal + pagesPerWeek;
        
        if (endPage > totalPages) endPage = totalPages;
        
        // Logic for Review (Simple simulation based on style)
        let reviewText = "-";
        if (style === 'spiral' && i > 1) {
            let reviewJuz = Math.ceil((startPage / 20)) - 1;
            if(reviewJuz < 1) reviewJuz = 1;
            reviewText = `Juz ${reviewJuz}`;
        } else if (style === 'mixed' && i % 4 === 0) {
            reviewText = "Rishikim Gjeneral";
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>Java ${i}</td>
            <td><strong>${startPage} - ${endPage}</strong> (${endPage - startPage + 1} faqe)</td>
            <td>${reviewText}</td>
            <td><span class="status-badge">Në pritje</span></td>
        `;
        tbody.appendChild(tr);
        
        currentTotal = endPage;
        if (currentTotal >= totalPages) break;
    }
}

function generateCharts(weeks, totalPages, pagesPerDay, style) {
    // Determine Review Ratio based on style
    let reviewPages = 0;
    if (style === 'spiral') reviewPages = totalPages * 0.5; // Simulate 50% extra effort for review
    if (style === 'mixed') reviewPages = totalPages * 0.2;
    
    const totalEffort = totalPages + reviewPages;

    // --- PIE CHART ---
    const ctxPie = document.getElementById('pieChart').getContext('2d');
    
    if (myPieChart) myPieChart.destroy(); // Destroy old chart if exists

    myPieChart = new Chart(ctxPie, {
        type: 'doughnut',
        data: {
            labels: ['Memorizim i Ri', 'Rishikim/Përforcim'],
            datasets: [{
                data: [totalPages, reviewPages],
                backgroundColor: ['#18A999', '#0F1C2E'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });

    // --- LINE CHART (Progress) ---
    const ctxLine = document.getElementById('lineChart').getContext('2d');
    
    if (myLineChart) myLineChart.destroy();

    // Create data points for the line chart
    let labels = [];
    let dataPoints = [];
    let accumulated = 0;
    const increment = totalPages / weeks;

    for(let i = 0; i <= weeks; i+= (weeks/10)) { // Show about 10 points
        let weekNum = Math.round(i);
        labels.push(`Java ${weekNum}`);
        dataPoints.push(Math.min(Math.round(accumulated), totalPages));
        accumulated += (increment * (weeks/10));
    }

    myLineChart = new Chart(ctxLine, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Progresi Kumulativ (Faqe)',
                data: dataPoints,
                borderColor: '#18A999',
                backgroundColor: 'rgba(24, 169, 153, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true, max: totalPages }
            }
        }
    });
}

function downloadPDF() {
    const element = document.getElementById('results-area');
    const name = document.getElementById('userName').value || "User";
    
    // Hide buttons during print
    const btn = document.querySelector('.section-header button');
    btn.style.display = 'none';

    const opt = {
        margin:       0.5,
        filename:     `Hifz_Plan_${name}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
        btn.style.display = 'block'; // Show button again
    });
}