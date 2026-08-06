// Weekly data - each point is a day (Mon-Sun), last 7 days
export const weeklyTestData = {
    labels: ["Mon 24", "Tue 25", "Wed 26", "Thu 27", "Fri 28", "Sat 29", "Sun 30"],
    datasets: [
        {
            label: "Happiness",
            data: [
                { x: "Mon 24", y: 0.72, top3: ["Blinding Lights", "Levitating", "Heat Waves"] },
                { x: "Tue 25", y: 0.18, top3: ["drivers license", "Happier Than Ever", "Easy On Me"] },
                { x: "Wed 26", y: 0.85, top3: ["Good 4 U", "Watermelon Sugar", "Peaches"] },
                { x: "Thu 27", y: 0.14, top3: ["Ghost", "Traitor", "STAY"] },
                { x: "Fri 28", y: 0.60, top3: ["Anti-Hero", "Cruel Summer", "As It Was"] },
                { x: "Sat 29", y: 0.91, top3: ["About Damn Time", "Industry Baby", "Shivers"] },
                { x: "Sun 30", y: 0.35, top3: ["Happier Than Ever", "deja vu", "Positions"] },
            ],
            borderColor: "#1DB954",
            backgroundColor: "#1DB954",
            tension: 0.4
        },
        {
            label: "Energy",
            data: [
                { x: "Mon 24", y: 0.80, top3: ["Blinding Lights", "Levitating", "Heat Waves"] },
                { x: "Tue 25", y: 0.15, top3: ["drivers license", "Happier Than Ever", "Easy On Me"] },
                { x: "Wed 26", y: 0.78, top3: ["Good 4 U", "Watermelon Sugar", "Peaches"] },
                { x: "Thu 27", y: 0.12, top3: ["Ghost", "Traitor", "STAY"] },
                { x: "Fri 28", y: 0.88, top3: ["Anti-Hero", "Cruel Summer", "As It Was"] },
                { x: "Sat 29", y: 0.55, top3: ["About Damn Time", "Industry Baby", "Shivers"] },
                { x: "Sun 30", y: 0.30, top3: ["Happier Than Ever", "deja vu", "Positions"] },
            ],
            borderColor: "#ff6384",
            backgroundColor: "#ff6384",
            tension: 0.4
        }
    ]
};

// Monthly data - each point is a week average
export const monthlyTestData = {
    labels: ["Week 1 (1-7 Mar)", "Week 2 (8-14 Mar)", "Week 3 (15-21 Mar)", "Week 4 (22-28 Mar)"],
    datasets: [
        {
            label: "Happiness",
            data: [
                { x: "Week 1 (1-7 Mar)",   y: 0.17, top3: ["drivers license", "Ghost", "Traitor"] },
                { x: "Week 2 (8-14 Mar)",  y: 0.65, top3: ["Blinding Lights", "Heat Waves", "Levitating"] },
                { x: "Week 3 (15-21 Mar)", y: 0.88, top3: ["Good 4 U", "Watermelon Sugar", "About Damn Time"] },
                { x: "Week 4 (22-28 Mar)", y: 0.42, top3: ["Happier Than Ever", "STAY", "deja vu"] },
            ],
            borderColor: "#1DB954",
            backgroundColor: "#1DB954",
            tension: 0.4
        },
        {
            label: "Energy",
            data: [
                { x: "Week 1 (1-7 Mar)",   y: 0.13, top3: ["drivers license", "Ghost", "Traitor"] },
                { x: "Week 2 (8-14 Mar)",  y: 0.78, top3: ["Blinding Lights", "Heat Waves", "Levitating"] },
                { x: "Week 3 (15-21 Mar)", y: 0.55, top3: ["Good 4 U", "Watermelon Sugar", "About Damn Time"] },
                { x: "Week 4 (22-28 Mar)", y: 0.82, top3: ["Happier Than Ever", "STAY", "deja vu"] },
            ],
            borderColor: "#ff6384",
            backgroundColor: "#ff6384",
            tension: 0.4
        }
    ]
};