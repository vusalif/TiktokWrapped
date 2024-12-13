document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const fileInput = document.getElementById('fileInput');
    const fileName = document.getElementById('fileName');
    const loadingSection = document.getElementById('loadingSection');
    const visualizationSection = document.getElementById('visualizationSection');
    const howToGetLink = document.getElementById('howToGet');
    const modal = document.getElementById('instructionsModal');
    const closeButton = document.querySelector('.close-button');
    const statsToggle = document.getElementById('statsToggle');
    const statsContent = document.getElementById('statsContent');
    const statsGrid = document.getElementById('statsGrid');
    const vizTypeToggle = document.getElementById('vizTypeToggle');
    const vizLabel = document.getElementById('vizLabel');
    const activityChartCanvas = document.getElementById('activityChart');
    const heatmapChart = document.getElementById('heatmapChart');
    const heatmapContent = document.getElementById('heatmapContent');
    const prevYearBtn = document.getElementById('prevYear');
    const nextYearBtn = document.getElementById('nextYear');
    const currentYearSpan = document.getElementById('currentYear');
    const allYearsBtn = document.getElementById('allYearsBtn');
    const commentsSection = document.getElementById('commentsSection');
    const commentActivityChart = document.getElementById('commentActivityChart');
    const wordCloudChart = document.getElementById('wordCloudChart');
    const commentStatsToggle = document.getElementById('commentStatsToggle');
    const commentStatsContent = document.getElementById('commentStatsContent');
    const commentStatsGrid = document.getElementById('commentStatsGrid');
    const commentsContainer = document.getElementById('commentsContainer');
    const commentPrevYear = document.getElementById('commentPrevYear');
    const commentNextYear = document.getElementById('commentNextYear');
    const commentCurrentYear = document.getElementById('commentCurrentYear');
    const commentAllYearsBtn = document.getElementById('commentAllYearsBtn');
    const directMessagesSection = document.getElementById('directMessagesSection');
    const dmActivityChart = document.getElementById('dmActivityChart');
    const dmUsersChart = document.getElementById('dmUsersChart');
    const dmStatsToggle = document.getElementById('dmStatsToggle');
    const dmStatsContent = document.getElementById('dmStatsContent');
    const dmStatsGrid = document.getElementById('dmStatsGrid');
    const messagesContainer = document.getElementById('messagesContainer');
    const dmPrevYear = document.getElementById('dmPrevYear');
    const dmNextYear = document.getElementById('dmNextYear');
    const dmCurrentYear = document.getElementById('dmCurrentYear');
    const dmAllYearsBtn = document.getElementById('dmAllYearsBtn');
    const profileSection = document.getElementById('profileSection');
    const profileUsername = document.getElementById('profileUsername');
    const profileBio = document.getElementById('profileBio');
    const profileLikes = document.getElementById('profileLikes');
    const highlightsSection = document.getElementById('highlightsSection');
    const highlightTitle = document.getElementById('highlightTitle');
    const highlightValue = document.getElementById('highlightValue');
    const highlightNext = document.getElementById('highlightNext');
    const showHighlightsBtn = document.getElementById('showHighlightsBtn');

    let activityChart = null;
    let currentData = null;
    let currentYear = null;
    let availableYears = [];
    let showingAllYears = false;
    let commentChart = null;
    let wordCloud = null;
    let currentCommentYear = null;
    let showingAllCommentYears = false;
    let commentData = null;
    let dmChart = null;
    let dmUsersChartInstance = null;
    let currentDmYear = null;
    let showingAllDmYears = false;
    let dmData = null;

    // Constants
    const CUTOFF_DATE = new Date('2016-09-01');
    const HEATMAP_COLORS = [
        'rgba(235, 237, 240, 1)',    // No activity
        'rgba(254, 44, 85, 0.2)',    // Low activity
        'rgba(254, 44, 85, 0.4)',    // Medium-low activity
        'rgba(254, 44, 85, 0.6)',    // Medium activity
        'rgba(254, 44, 85, 0.8)',    // Medium-high activity
        'rgba(254, 44, 85, 1)'       // High activity
    ];

    // Event Listeners
    fileInput.addEventListener('change', handleFileUpload);
    howToGetLink.addEventListener('click', showModal);
    closeButton.addEventListener('click', hideModal);
    statsToggle.addEventListener('click', toggleStats);
    vizTypeToggle.addEventListener('change', handleVizTypeChange);
    prevYearBtn.addEventListener('click', () => navigateYear(-1));
    nextYearBtn.addEventListener('click', () => navigateYear(1));
    allYearsBtn.addEventListener('click', toggleAllYears);
    commentStatsToggle.addEventListener('click', toggleCommentStats);
    commentPrevYear.addEventListener('click', () => navigateCommentYear(-1));
    commentNextYear.addEventListener('click', () => navigateCommentYear(1));
    commentAllYearsBtn.addEventListener('click', toggleAllCommentYears);
    dmStatsToggle.addEventListener('click', toggleDmStats);
    dmPrevYear.addEventListener('click', () => navigateDmYear(-1));
    dmNextYear.addEventListener('click', () => navigateDmYear(1));
    dmAllYearsBtn.addEventListener('click', toggleAllDmYears);
    showHighlightsBtn.addEventListener('click', () => {
        visualizationSection.classList.add('hidden');
        const yearStats = currentData.statsByYear[currentYear];
        showHighlights(yearStats, currentYear);
    });
    window.addEventListener('click', (e) => {
        if (e.target === modal) hideModal();
    });

    function showModal(e) {
        e.preventDefault();
        modal.classList.remove('hidden');
    }

    function hideModal() {
        modal.classList.add('hidden');
    }

    function toggleStats() {
        statsContent.classList.toggle('hidden');
        statsToggle.classList.toggle('active');
        const icon = statsToggle.querySelector('.toggle-icon');
        if (icon) {
            icon.textContent = statsContent.classList.contains('hidden') ? '▼' : '▲';
        }
    }

    function toggleAllYears() {
        showingAllYears = !showingAllYears;
        allYearsBtn.textContent = showingAllYears ? 'Show Single Year' : 'Show All Years';
        allYearsBtn.classList.toggle('active', showingAllYears);
        
        if (vizTypeToggle.checked) {
            showingAllYears = false;
            allYearsBtn.classList.remove('active');
            allYearsBtn.textContent = 'Show All Years';
        }
        
        updateVisualization();
        updateYearNavigation();
    }

    function updateVisualization() {
        if (vizTypeToggle.checked) {
            createHeatmap(currentData.timelineData);
            displayStatistics(currentData.stats, currentYear);
        } else {
            createBarChart(currentData.timelineData);
            displayStatistics(currentData.stats, showingAllYears ? null : currentYear);
        }
    }

    function handleVizTypeChange() {
        const isHeatmap = vizTypeToggle.checked;
        vizLabel.textContent = isHeatmap ? 'Heatmap' : 'Bar Graph';
        
        if (isHeatmap) {
            showingAllYears = false;
            allYearsBtn.classList.remove('active');
            allYearsBtn.textContent = 'Show All Years';
            activityChartCanvas.classList.add('hidden');
            heatmapChart.classList.remove('hidden');
        } else {
            activityChartCanvas.classList.remove('hidden');
            heatmapChart.classList.add('hidden');
        }
        
        if (currentData) {
            updateVisualization();
        }
        updateYearNavigation();
    }

    function navigateYear(direction) {
        const currentIndex = availableYears.indexOf(currentYear);
        const newIndex = currentIndex + direction;
        
        if (newIndex >= 0 && newIndex < availableYears.length) {
            currentYear = availableYears[newIndex];
            updateVisualization();
            updateYearNavigation();
        }
    }

    function updateYearNavigation() {
        const yearNavigationVisible = !showingAllYears || vizTypeToggle.checked;
        currentYearSpan.textContent = currentYear;
        
        if (yearNavigationVisible) {
            prevYearBtn.disabled = currentYear === availableYears[0];
            nextYearBtn.disabled = currentYear === availableYears[availableYears.length - 1];
            prevYearBtn.style.visibility = 'visible';
            nextYearBtn.style.visibility = 'visible';
            currentYearSpan.style.visibility = 'visible';
        } else {
            prevYearBtn.style.visibility = 'hidden';
            nextYearBtn.style.visibility = 'hidden';
            currentYearSpan.style.visibility = 'hidden';
        }
        
        // Hide "Show All Years" button in heatmap view
        allYearsBtn.style.display = vizTypeToggle.checked ? 'none' : 'block';
    }

    async function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        fileName.textContent = file.name;
        loadingSection.classList.remove('hidden');
        visualizationSection.classList.add('hidden');
        commentsSection.classList.add('hidden');
        directMessagesSection.classList.add('hidden');
        profileSection.classList.add('hidden');

        try {
            const jsonData = await readFileContent(file);
            
            // Process profile data first
            const profileData = processProfileData(jsonData);
            if (profileData) {
                profileUsername.textContent = `@${profileData.username}`;
                profileBio.textContent = profileData.bio;
                profileLikes.textContent = Number(profileData.likesReceived).toLocaleString();
                profileSection.classList.remove('hidden');
            }

            currentData = processJsonData(jsonData);
            commentData = processCommentData(jsonData);
            dmData = processDmData(jsonData);
            
            availableYears = [...new Set([
                ...currentData.timelineData.dates.map(date => new Date(date).getFullYear()),
                ...commentData.timelineData.dates.map(date => new Date(date).getFullYear()),
                ...dmData.timelineData.dates.map(date => new Date(date).getFullYear())
            ])].sort();
            
            if (availableYears.length > 0) {
                currentYear = availableYears[availableYears.length - 1];
                currentCommentYear = currentYear;
                currentDmYear = currentYear;
                
                // Show highlights first
                const yearStats = currentData.statsByYear[currentYear];
                showHighlights(yearStats, currentYear);
                
                updateVisualization();
                
                if (commentData.comments.length > 0) {
                    updateCommentVisualization();
                    commentsSection.classList.remove('hidden');
                }

                if (dmData.messages.length > 0) {
                    updateDmVisualization();
                    directMessagesSection.classList.remove('hidden');
                }
                
                updateYearNavigation();
                updateCommentYearNavigation();
                updateDmYearNavigation();
            } else {
                throw new Error('No valid data found in the file');
            }
        } catch (error) {
            alert('Error processing file: ' + error.message);
            console.error('Error details:', error);
        } finally {
            loadingSection.classList.add('hidden');
        }
    }

    function readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const jsonData = JSON.parse(event.target.result);
                    resolve(jsonData);
                } catch (error) {
                    reject(new Error('Invalid JSON file'));
                }
            };
            reader.onerror = () => reject(new Error('Error reading file'));
            reader.readAsText(file);
        });
    }

    function isValidDate(date) {
        return date >= CUTOFF_DATE;
    }

    function processJsonData(data) {
        const activities = [];
        const statsByYear = {};
        const allStats = {
            likes: 0,
            videoBrowsing: 0,
            following: 0,
            favoriteEffects: 0,
            favoriteSounds: 0,
            favoriteVideos: 0,
            shares: 0
        };

        // Helper function to process activities
        function processActivityList(items, statKey) {
            if (!items) return;
            items.forEach(item => {
                if (item.Date) {
                    const date = new Date(item.Date);
                    if (isValidDate(date)) {
                        activities.push(date);
                        const year = date.getFullYear();
                        
                        // Initialize stats for the year if not exists
                        if (!statsByYear[year]) {
                            statsByYear[year] = {
                                likes: 0,
                                videoBrowsing: 0,
                                following: 0,
                                favoriteEffects: 0,
                                favoriteSounds: 0,
                                favoriteVideos: 0,
                                shares: 0
                            };
                        }
                        
                        // Update both all-time and year-specific stats
                        allStats[statKey]++;
                        statsByYear[year][statKey]++;
                    }
                }
            });
        }

        // Process all activity types
        if (data.Activity) {
            processActivityList(data.Activity['Like List']?.ItemFavoriteList, 'likes');
            processActivityList(data.Activity['Video Browsing History']?.VideoList, 'videoBrowsing');
            processActivityList(data.Activity['Following List']?.Following, 'following');
            processActivityList(data.Activity['Favorite Effects']?.FavoriteEffectsList, 'favoriteEffects');
            processActivityList(data.Activity['Favorite Sounds']?.FavoriteSoundList, 'favoriteSounds');
            processActivityList(data.Activity['Favorite Videos']?.FavoriteVideoList, 'favoriteVideos');
            processActivityList(data.Activity['Share History']?.ShareHistoryList, 'shares');
        }

        // Add total activities to each year's stats and all-time stats
        allStats.totalActivities = Object.values(allStats).reduce((a, b) => a + b, 0);
        Object.keys(statsByYear).forEach(year => {
            statsByYear[year].totalActivities = Object.values(statsByYear[year]).reduce((a, b) => a + b, 0);
        });

        // Group activities by day
        const activityByDay = activities.reduce((acc, date) => {
            const dayKey = date.toISOString().split('T')[0];
            acc[dayKey] = (acc[dayKey] || 0) + 1;
            return acc;
        }, {});

        // Convert to sorted array of [date, count] pairs
        const sortedData = Object.entries(activityByDay)
            .sort(([dateA], [dateB]) => dateA.localeCompare(dateB));

        return {
            timelineData: {
                dates: sortedData.map(([date]) => date),
                counts: sortedData.map(([, count]) => count)
            },
            stats: allStats,
            statsByYear: statsByYear
        };
    }

    function displayStatistics(stats, year = null) {
        const displayStats = year && currentData.statsByYear[year] ? currentData.statsByYear[year] : stats;
        const timeFrame = year ? `in ${year}` : 'since Sept 2016';

        const statCards = [
            {
                title: 'Total Activities',
                value: displayStats.totalActivities,
                subtitle: `Total interactions ${timeFrame}`
            },
            {
                title: 'Likes',
                value: displayStats.likes,
                subtitle: `Videos you liked ${timeFrame}`
            },
            {
                title: 'Video Views',
                value: displayStats.videoBrowsing,
                subtitle: `Videos you watched ${timeFrame}`
            },
            {
                title: 'Following',
                value: displayStats.following,
                subtitle: `Accounts you followed ${timeFrame}`
            },
            {
                title: 'Favorite Effects',
                value: displayStats.favoriteEffects,
                subtitle: `Effects you saved ${timeFrame}`
            },
            {
                title: 'Favorite Sounds',
                value: displayStats.favoriteSounds,
                subtitle: `Sounds you saved ${timeFrame}`
            },
            {
                title: 'Favorite Videos',
                value: displayStats.favoriteVideos,
                subtitle: `Videos you favorited ${timeFrame}`
            },
            {
                title: 'Shares',
                value: displayStats.shares,
                subtitle: `Videos you shared ${timeFrame}`
            }
        ];

        statsGrid.innerHTML = statCards.map(card => `
            <div class="stat-card">
                <h3>${card.title}</h3>
                <p>${card.value.toLocaleString()}</p>
                <div class="stat-subtitle">${card.subtitle}</div>
            </div>
        `).join('');
    }

    function filterDataByYear(data, year) {
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31);
        
        const filteredDates = [];
        const filteredCounts = [];
        
        data.dates.forEach((date, index) => {
            const currentDate = new Date(date);
            if (currentDate >= startDate && currentDate <= endDate) {
                filteredDates.push(date);
                filteredCounts.push(data.counts[index]);
            }
        });
        
        return {
            dates: filteredDates,
            counts: filteredCounts
        };
    }

    function createBarChart(data) {
        const chartData = showingAllYears ? data : filterDataByYear(data, currentYear);
        
        if (activityChart) {
            activityChart.destroy();
        }

        const ctx = activityChartCanvas.getContext('2d');
        activityChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartData.dates,
                datasets: [{
                    label: 'Daily Activity',
                    data: chartData.dates.map((date, index) => ({
                        x: date,
                        y: chartData.counts[index]
                    })),
                    backgroundColor: 'rgba(254, 44, 85, 0.8)',
                    borderColor: 'rgba(254, 44, 85, 1)',
                    borderWidth: 1,
                    borderRadius: 4,
                    barPercentage: 0.8,
                    categoryPercentage: 0.9
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: showingAllYears ? 'Your TikTok Activity Over Time' : `Your TikTok Activity in ${currentYear}`,
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            title: (context) => {
                                const date = new Date(context[0].raw.x);
                                return date.toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                });
                            },
                            label: (context) => {
                                return `${context.raw.y} activities`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day',
                            displayFormats: {
                                day: 'MMM d'
                            }
                        },
                        title: {
                            display: true,
                            text: 'Date'
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Activities'
                        },
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    function createHeatmap(data) {
        // Get available years and set current year if not set
        availableYears = [...new Set(data.dates.map(date => new Date(date).getFullYear()))].sort();
        if (!currentYear || !availableYears.includes(currentYear)) {
            currentYear = availableYears[availableYears.length - 1]; // Start with most recent year
        }
        
        updateYearNavigation();

        // Convert data to a map of date -> count
        const dateMap = new Map();
        data.dates.forEach((date, index) => {
            dateMap.set(date, data.counts[index]);
        });

        // Find the maximum count for color scaling
        const maxCount = Math.max(...data.counts);

        // Clear previous heatmap
        heatmapContent.innerHTML = '';

        // Create container for the heatmap
        const container = document.createElement('div');
        container.className = 'heatmap-container';

        // Add month labels
        const monthLabels = document.createElement('div');
        monthLabels.className = 'month-labels';
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        monthLabels.innerHTML = months.map(month => `<div>${month}</div>`).join('');
        container.appendChild(monthLabels);

        // Create grid for the current year
        const grid = document.createElement('div');
        grid.className = 'heatmap-row';

        // Generate cells for each day of the year
        const startDate = new Date(currentYear, 0, 1);
        const endDate = new Date(currentYear, 11, 31);

        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
            const cell = document.createElement('div');
            cell.className = 'heatmap-cell';
            
            const dateStr = date.toISOString().split('T')[0];
            const count = dateMap.get(dateStr) || 0;
            
            // Calculate color based on activity level
            const colorIndex = Math.min(
                Math.floor((count / maxCount) * (HEATMAP_COLORS.length - 1)),
                HEATMAP_COLORS.length - 1
            );
            cell.style.backgroundColor = HEATMAP_COLORS[colorIndex];

            // Add tooltip
            cell.title = `${date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}\n${count} activities`;

            grid.appendChild(cell);
        }

        container.appendChild(grid);

        // Add legend
        const legend = document.createElement('div');
        legend.className = 'heatmap-legend';
        legend.innerHTML = `
            <div class="legend-item">Less</div>
            ${HEATMAP_COLORS.slice(1).map(color => `
                <div class="legend-color" style="background-color: ${color}"></div>
            `).join('')}
            <div class="legend-item">More</div>
        `;
        container.appendChild(legend);

        heatmapContent.appendChild(container);
    }

    function processCommentData(data) {
        // Default return value if no comments found
        const emptyData = {
            timelineData: { dates: [], counts: [] },
            comments: [],
            stats: {
                totalComments: 0,
                uniqueWords: 0,
                avgWordsPerComment: 0,
                wordFrequency: {}
            },
            statsByYear: {}
        };

        try {
            // Log the data structure to debug
            console.log('Comment data structure:', data?.Comment?.Comments?.CommentsList);

            if (!data?.Comment?.Comments?.CommentsList) {
                console.log('No comments list found');
                return emptyData;
            }

            const comments = [];
            const wordFrequency = {};
            const commentsByYear = {};

            data.Comment.Comments.CommentsList.forEach(item => {
                // Check for both uppercase and lowercase date field
                const dateStr = item.Date || item.date;
                const commentText = item.comment;

                if (dateStr && commentText) {
                    const date = new Date(dateStr);
                    if (isValidDate(date)) {
                        const year = date.getFullYear();
                        const comment = commentText.trim();
                        
                        // Initialize year stats if not exists
                        if (!commentsByYear[year]) {
                            commentsByYear[year] = {
                                comments: [],
                                wordFrequency: {},
                                totalComments: 0,
                                uniqueWords: 0,
                                avgWordsPerComment: 0
                            };
                        }

                        // Add comment to collections
                        comments.push({
                            date: date,
                            text: comment,
                            year: year
                        });

                        commentsByYear[year].comments.push({
                            date: date,
                            text: comment
                        });

                        // Process words
                        const words = comment.toLowerCase()
                            .replace(/[^\w\s]/g, '')
                            .split(/\s+/)
                            .filter(word => word.length > 2);

                        words.forEach(word => {
                            wordFrequency[word] = (wordFrequency[word] || 0) + 1;
                            commentsByYear[year].wordFrequency[word] = (commentsByYear[year].wordFrequency[word] || 0) + 1;
                        });
                    }
                }
            });

            console.log('Processed comments:', comments.length);
            console.log('Word frequency:', wordFrequency);

            if (comments.length === 0) {
                console.log('No valid comments found after processing');
                return emptyData;
            }

            // Calculate statistics
            const allCommentStats = {
                totalComments: comments.length,
                uniqueWords: Object.keys(wordFrequency).length,
                wordFrequency: wordFrequency,
                avgWordsPerComment: comments.reduce((acc, comment) => 
                    acc + comment.text.split(/\s+/).length, 0) / comments.length
            };

            // Calculate year-specific statistics
            Object.keys(commentsByYear).forEach(year => {
                const yearStats = commentsByYear[year];
                yearStats.totalComments = yearStats.comments.length;
                yearStats.uniqueWords = Object.keys(yearStats.wordFrequency).length;
                yearStats.avgWordsPerComment = yearStats.comments.reduce((acc, comment) => 
                    acc + comment.text.split(/\s+/).length, 0) / yearStats.comments.length;
            });

            // Group comments by day
            const commentsByDay = comments.reduce((acc, comment) => {
                const dayKey = comment.date.toISOString().split('T')[0];
                acc[dayKey] = (acc[dayKey] || 0) + 1;
                return acc;
            }, {});

            const sortedData = Object.entries(commentsByDay)
                .sort(([dateA], [dateB]) => dateA.localeCompare(dateB));

            console.log('Final processed data:', {
                timelineData: {
                    dates: sortedData.map(([date]) => date),
                    counts: sortedData.map(([, count]) => count)
                },
                comments: comments.length,
                uniqueWords: Object.keys(wordFrequency).length
            });

            return {
                timelineData: {
                    dates: sortedData.map(([date]) => date),
                    counts: sortedData.map(([, count]) => count)
                },
                comments: comments,
                stats: allCommentStats,
                statsByYear: commentsByYear
            };
        } catch (error) {
            console.error('Error processing comment data:', error);
            return emptyData;
        }
    }

    function updateCommentVisualization() {
        if (!commentData || !commentData.timelineData) {
            console.log('No comment data available');
            return;
        }

        const yearData = showingAllCommentYears ? 
            commentData.timelineData : 
            filterDataByYear(commentData.timelineData, currentCommentYear);
        
        // Only update charts when necessary
        if (!commentChart) {
            createCommentChart(yearData);
        } else {
            updateCommentChartData(yearData);
        }

        // Only create or update word cloud if data changes
        const wordFreqData = showingAllCommentYears ? 
            commentData.stats?.wordFrequency : 
            commentData.statsByYear[currentCommentYear]?.wordFrequency;

        if (wordFreqData && Object.keys(wordFreqData).length > 0) {
            if (!wordCloud) {
                createWordCloud(wordFreqData);
            } else {
                updateWordCloudData(wordFreqData);
            }
        }

        displayCommentStatistics(commentData.stats, currentCommentYear);
        
        const commentsToShow = showingAllCommentYears ? 
            commentData.comments : 
            commentData.statsByYear[currentCommentYear]?.comments;

        if (commentsToShow && commentsToShow.length > 0) {
            displayComments(commentsToShow);
        }
    }

    function updateCommentChartData(data) {
        if (!commentChart) return;

        commentChart.data.labels = data.dates;
        commentChart.data.datasets[0].data = data.dates.map((date, index) => ({
            x: date,
            y: data.counts[index]
        }));

        commentChart.options.plugins.title.text = showingAllCommentYears ? 
            'Your TikTok Comments Over Time' : 
            `Your TikTok Comments in ${currentCommentYear}`;

        commentChart.update('none');
    }

    function updateWordCloudData(wordFrequency) {
        if (!wordCloud) return;

        const topWords = Object.entries(wordFrequency)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10);

        wordCloud.data.labels = topWords.map(([word]) => word);
        wordCloud.data.datasets[0].data = topWords.map(([, count]) => count);
        wordCloud.update('none'); // Use 'none' mode for faster updates
    }

    function createCommentChart(data) {
        if (commentChart) {
            commentChart.destroy();
        }

        const ctx = commentActivityChart.getContext('2d');

        const chartData = {
            labels: data.dates,
            datasets: [{
                label: 'Daily Comments',
                data: data.dates.map((date, index) => ({
                    x: date,
                    y: data.counts[index]
                })),
                backgroundColor: 'rgba(254, 44, 85, 0.6)',
                borderColor: 'rgba(254, 44, 85, 1)',
                borderWidth: 1,
                borderRadius: 2,
                barPercentage: 0.6,
                categoryPercentage: 0.7,
                pointStyle: false
            }]
        };

        const chartOptions = {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            animation: false,
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            },
            hover: {
                mode: 'nearest',
                intersect: false,
                animationDuration: 0
            },
            layout: {
                padding: {
                    top: 10,
                    right: 10,
                    bottom: 10,
                    left: 10
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: showingAllCommentYears ? 
                        'Your TikTok Comments Over Time' : 
                        `Your TikTok Comments in ${currentCommentYear}`,
                    font: {
                        size: 14,
                        weight: 'bold'
                    },
                    padding: {
                        top: 0,
                        bottom: 10
                    }
                },
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: true,
                    mode: 'nearest',
                    intersect: false,
                    animation: false,
                    callbacks: {
                        title: (context) => {
                            const date = new Date(context[0].raw.x);
                            return date.toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            });
                        },
                        label: (context) => {
                            return `${context.raw.y} comments`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day',
                        displayFormats: {
                            day: 'MMM d'
                        },
                        tooltipFormat: 'PP'
                    },
                    title: {
                        display: true,
                        text: 'Date',
                        font: {
                            size: 12
                        }
                    },
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxTicksLimit: 8,
                        source: 'auto',
                        autoSkip: true,
                        font: {
                            size: 11
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Comments',
                        font: {
                            size: 12
                        }
                    },
                    ticks: {
                        stepSize: 1,
                        maxTicksLimit: 6,
                        font: {
                            size: 11
                        }
                    },
                    grid: {
                        borderDash: [2, 2],
                        drawBorder: false
                    }
                }
            }
        };

        commentChart = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: chartOptions
        });
    }

    function createWordCloud(wordFrequency) {
        if (wordCloud) {
            wordCloud.destroy();
        }

        const topWords = Object.entries(wordFrequency)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10);

        const ctx = wordCloudChart.getContext('2d');
        wordCloud = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: topWords.map(([word]) => word),
                datasets: [{
                    data: topWords.map(([, count]) => count),
                    backgroundColor: topWords.map((_, index) => 
                        `hsla(${340 + (index * 8)}, 85%, 60%, 0.8)`
                    )
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 1.5,
                animation: false,
                layout: {
                    padding: {
                        top: 10,
                        right: 10,
                        bottom: 10,
                        left: 10
                    }
                },
                hover: {
                    animationDuration: 0
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Top 10 Most Used Words',
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        padding: {
                            top: 0,
                            bottom: 10
                        }
                    },
                    tooltip: {
                        animation: false,
                        callbacks: {
                            label: (context) => {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                return `${label}: ${value} times`;
                            }
                        }
                    }
                }
            }
        });
    }

    function displayCommentStatistics(stats, year = null) {
        const displayStats = year && commentData.statsByYear[year] ? 
            commentData.statsByYear[year] : 
            stats;
        const timeFrame = year ? `in ${year}` : 'since Sept 2016';

        const statCards = [
            {
                title: 'Total Comments',
                value: displayStats.totalComments,
                subtitle: `Comments posted ${timeFrame}`
            },
            {
                title: 'Unique Words',
                value: displayStats.uniqueWords,
                subtitle: `Different words used ${timeFrame}`
            },
            {
                title: 'Average Words',
                value: Math.round(displayStats.avgWordsPerComment * 10) / 10,
                subtitle: `Words per comment ${timeFrame}`
            }
        ];

        commentStatsGrid.innerHTML = statCards.map(card => `
            <div class="stat-card">
                <h3>${card.title}</h3>
                <p>${card.value.toLocaleString()}</p>
                <div class="stat-subtitle">${card.subtitle}</div>
            </div>
        `).join('');
    }

    function displayComments(comments) {
        commentsContainer.innerHTML = comments
            .sort((a, b) => b.date - a.date)
            .map(comment => `
                <div class="comment-item">
                    <div class="comment-date">
                        ${comment.date.toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </div>
                    <div class="comment-text">${comment.text}</div>
                </div>
            `).join('');
    }

    function navigateCommentYear(direction) {
        const currentIndex = availableYears.indexOf(currentCommentYear);
        const newIndex = currentIndex + direction;
        
        if (newIndex >= 0 && newIndex < availableYears.length) {
            currentCommentYear = availableYears[newIndex];
            updateCommentVisualization();
            updateCommentYearNavigation();
        }
    }

    function updateCommentYearNavigation() {
        const yearNavigationVisible = !showingAllCommentYears;
        commentCurrentYear.textContent = currentCommentYear;
        
        if (yearNavigationVisible) {
            commentPrevYear.disabled = currentCommentYear === availableYears[0];
            commentNextYear.disabled = currentCommentYear === availableYears[availableYears.length - 1];
            commentPrevYear.style.visibility = 'visible';
            commentNextYear.style.visibility = 'visible';
            commentCurrentYear.style.visibility = 'visible';
        } else {
            commentPrevYear.style.visibility = 'hidden';
            commentNextYear.style.visibility = 'hidden';
            commentCurrentYear.style.visibility = 'hidden';
        }
    }

    function toggleAllCommentYears() {
        showingAllCommentYears = !showingAllCommentYears;
        commentAllYearsBtn.textContent = showingAllCommentYears ? 'Show Single Year' : 'Show All Years';
        commentAllYearsBtn.classList.toggle('active', showingAllCommentYears);
        
        updateCommentVisualization();
        updateCommentYearNavigation();
    }

    function toggleCommentStats() {
        commentStatsContent.classList.toggle('hidden');
        commentStatsToggle.classList.toggle('active');
        const icon = commentStatsToggle.querySelector('.toggle-icon');
        if (icon) {
            icon.textContent = commentStatsContent.classList.contains('hidden') ? '▼' : '▲';
        }
    }

    function processDmData(data) {
        const emptyData = {
            timelineData: { dates: [], counts: [] },
            messages: [],
            stats: {
                totalMessages: 0,
                uniqueUsers: 0,
                userFrequency: {},
                avgMessageLength: 0
            },
            statsByYear: {},
            originalData: data  // Store the original data
        };

        try {
            // Get user's own username from the correct path in profile information
            const ownUsername = data?.Profile?.['Profile Information']?.ProfileMap?.userName || '';
            console.log('Own username:', ownUsername); // For debugging

            if (!data?.['Direct Messages']?.['Chat History']?.ChatHistory) {
                console.log('No DM data found');
                return emptyData;
            }

            const messages = [];
            const userFrequency = {};
            const messagesByYear = {};

            // Process each chat history
            Object.entries(data['Direct Messages']['Chat History'].ChatHistory).forEach(([chatTitle, chatMessages]) => {
                if (Array.isArray(chatMessages)) {
                    chatMessages.forEach(message => {
                        if (message.Date && message.From && message.Content) {
                            // Skip messages from own username
                            if (message.From === ownUsername) {
                                return;
                            }

                            const date = new Date(message.Date);
                            if (isValidDate(date)) {
                                const year = date.getFullYear();
                                
                                // Initialize year stats if not exists
                                if (!messagesByYear[year]) {
                                    messagesByYear[year] = {
                                        messages: [],
                                        userFrequency: {},
                                        totalMessages: 0,
                                        uniqueUsers: 0,
                                        avgMessageLength: 0
                                    };
                                }

                                // Add message to collections
                                const messageData = {
                                    date: date,
                                    from: message.From,
                                    content: message.Content,
                                    year: year
                                };

                                messages.push(messageData);
                                messagesByYear[year].messages.push(messageData);

                                // Track user frequency (excluding own username)
                                userFrequency[message.From] = (userFrequency[message.From] || 0) + 1;
                                messagesByYear[year].userFrequency[message.From] = 
                                    (messagesByYear[year].userFrequency[message.From] || 0) + 1;
                            }
                        }
                    });
                }
            });

            if (messages.length === 0) {
                return emptyData;
            }

            // Calculate statistics
            const allStats = {
                totalMessages: messages.length,
                uniqueUsers: Object.keys(userFrequency).length,
                userFrequency: userFrequency,
                avgMessageLength: messages.reduce((acc, msg) => 
                    acc + msg.content.length, 0) / messages.length
            };

            // Calculate year-specific statistics
            Object.keys(messagesByYear).forEach(year => {
                const yearStats = messagesByYear[year];
                yearStats.totalMessages = yearStats.messages.length;
                yearStats.uniqueUsers = Object.keys(yearStats.userFrequency).length;
                yearStats.avgMessageLength = yearStats.messages.reduce((acc, msg) => 
                    acc + msg.content.length, 0) / yearStats.messages.length;
            });

            // Group messages by day
            const messagesByDay = messages.reduce((acc, message) => {
                const dayKey = message.date.toISOString().split('T')[0];
                acc[dayKey] = (acc[dayKey] || 0) + 1;
                return acc;
            }, {});

            const sortedData = Object.entries(messagesByDay)
                .sort(([dateA], [dateB]) => dateA.localeCompare(dateB));

            return {
                timelineData: {
                    dates: sortedData.map(([date]) => date),
                    counts: sortedData.map(([, count]) => count)
                },
                messages: messages,
                stats: allStats,
                statsByYear: messagesByYear,
                originalData: data  // Include the original data in the return
            };
        } catch (error) {
            console.error('Error processing DM data:', error);
            return emptyData;
        }
    }

    function updateDmVisualization() {
        if (!dmData || !dmData.timelineData) {
            console.log('No DM data available');
            return;
        }

        const yearData = showingAllDmYears ? 
            dmData.timelineData : 
            filterDataByYear(dmData.timelineData, currentDmYear);
        
        if (!dmChart) {
            createDmChart(yearData);
        } else {
            updateDmChartData(yearData);
        }

        const userFreqData = showingAllDmYears ? 
            dmData.stats.userFrequency : 
            dmData.statsByYear[currentDmYear]?.userFrequency;

        if (userFreqData && Object.keys(userFreqData).length > 0) {
            if (!dmUsersChartInstance) {
                createDmUsersChart(userFreqData);
            } else {
                updateDmUsersChartData(userFreqData);
            }
        }

        displayDmStatistics(dmData.stats, currentDmYear);
        
        const messagesToShow = showingAllDmYears ? 
            dmData.messages : 
            dmData.statsByYear[currentDmYear]?.messages;

        if (messagesToShow && messagesToShow.length > 0) {
            displayMessages(messagesToShow);
        }
    }

    // Add this before the chart creation functions
    const chartScaleOptions = {
        x: {
            type: 'time',
            time: {
                unit: 'day',
                displayFormats: {
                    day: 'MMM d'
                },
                tooltipFormat: 'PP'
            },
            title: {
                display: true,
                text: 'Date',
                font: {
                    size: 12
                }
            },
            grid: {
                display: false
            },
            ticks: {
                maxTicksLimit: 8,
                source: 'auto',
                autoSkip: true,
                font: {
                    size: 11
                }
            }
        },
        y: {
            beginAtZero: true,
            title: {
                display: true,
                text: 'Number of Activities',
                font: {
                    size: 12
                }
            },
            ticks: {
                stepSize: 1,
                maxTicksLimit: 6,
                font: {
                    size: 11
                }
            },
            grid: {
                borderDash: [2, 2],
                drawBorder: false
            }
        }
    };

    // Update createDmChart function to use custom scale options
    function createDmChart(data) {
        if (dmChart) {
            dmChart.destroy();
        }

        const ctx = dmActivityChart.getContext('2d');
        dmChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.dates,
                datasets: [{
                    label: 'Daily Messages',
                    data: data.dates.map((date, index) => ({
                        x: date,
                        y: data.counts[index]
                    })),
                    backgroundColor: 'rgba(254, 44, 85, 0.6)',
                    borderColor: 'rgba(254, 44, 85, 1)',
                    borderWidth: 1,
                    borderRadius: 2,
                    barPercentage: 0.95,
                    categoryPercentage: 0.95
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2,
                animation: false,
                layout: {
                    padding: {
                        top: 10,
                        right: 10,
                        bottom: 10,
                        left: 10
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: showingAllDmYears ? 
                            'Your TikTok Messages Over Time' : 
                            `Your TikTok Messages in ${currentDmYear}`,
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            title: (context) => {
                                const date = new Date(context[0].raw.x);
                                return date.toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                });
                            },
                            label: (context) => {
                                return `${context.raw.y} messages`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ...chartScaleOptions.x,
                        title: {
                            ...chartScaleOptions.x.title,
                            text: 'Date'
                        },
                        offset: false,
                        ticks: {
                            ...chartScaleOptions.x.ticks,
                            align: 'center'
                        }
                    },
                    y: {
                        ...chartScaleOptions.y,
                        title: {
                            ...chartScaleOptions.y.title,
                            text: 'Number of Messages'
                        }
                    }
                }
            }
        });
    }

    // Add update function for DM chart data
    function updateDmChartData(data) {
        if (!dmChart) return;

        dmChart.data.labels = data.dates;
        dmChart.data.datasets[0].data = data.dates.map((date, index) => ({
            x: date,
            y: data.counts[index]
        }));

        dmChart.options.plugins.title.text = showingAllDmYears ? 
            'Your TikTok Messages Over Time' : 
            `Your TikTok Messages in ${currentDmYear}`;

        dmChart.update('none');
    }

    // Add update function for DM users chart data
    function updateDmUsersChartData(userFrequency) {
        if (!dmUsersChartInstance) return;

        const topUsers = Object.entries(userFrequency)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10);

        dmUsersChartInstance.data.labels = topUsers.map(([user]) => user);
        dmUsersChartInstance.data.datasets[0].data = topUsers.map(([, count]) => count);
        dmUsersChartInstance.update('none');
    }

    function createDmUsersChart(userFrequency) {
        if (dmUsersChartInstance) {
            dmUsersChartInstance.destroy();
        }

        const topUsers = Object.entries(userFrequency)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10);

        const ctx = dmUsersChart.getContext('2d');
        dmUsersChartInstance = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: topUsers.map(([user]) => user),
                datasets: [{
                    data: topUsers.map(([, count]) => count),
                    backgroundColor: topUsers.map((_, index) => 
                        `hsla(${340 + (index * 8)}, 85%, 60%, 0.8)`
                    )
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 1.5,
                animation: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Top 10 Most Active Contacts',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                return `${label}: ${value} messages`;
                            }
                        }
                    }
                }
            }
        });
    }

    function displayDmStatistics(stats, year = null) {
        const displayStats = year && dmData.statsByYear[year] ? 
            dmData.statsByYear[year] : 
            stats;
        const timeFrame = year ? `in ${year}` : 'since Sept 2016';

        const statCards = [
            {
                title: 'Total Messages',
                value: displayStats.totalMessages,
                subtitle: `Messages ${timeFrame}`
            },
            {
                title: 'Active Contacts',
                value: displayStats.uniqueUsers,
                subtitle: `Different users ${timeFrame}`
            },
            {
                title: 'Avg Message Length',
                value: Math.round(displayStats.avgMessageLength),
                subtitle: `Characters per message ${timeFrame}`
            }
        ];

        dmStatsGrid.innerHTML = statCards.map(card => `
            <div class="stat-card">
                <h3>${card.title}</h3>
                <p>${card.value.toLocaleString()}</p>
                <div class="stat-subtitle">${card.subtitle}</div>
            </div>
        `).join('');
    }

    function displayMessages(messages) {
        messagesContainer.innerHTML = messages
            .sort((a, b) => b.date - a.date)
            .map(message => `
                <div class="message-item">
                    <div class="message-header">
                        <span class="message-from">${message.from}</span>
                        <span class="message-date">${message.date.toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}</span>
                    </div>
                    <div class="message-content">${message.content}</div>
                </div>
            `).join('');
    }

    function toggleDmStats() {
        dmStatsContent.classList.toggle('hidden');
        dmStatsToggle.classList.toggle('active');
        const icon = dmStatsToggle.querySelector('.toggle-icon');
        if (icon) {
            icon.textContent = dmStatsContent.classList.contains('hidden') ? '▼' : '▲';
        }
    }

    function navigateDmYear(direction) {
        const currentIndex = availableYears.indexOf(currentDmYear);
        const newIndex = currentIndex + direction;
        
        if (newIndex >= 0 && newIndex < availableYears.length) {
            currentDmYear = availableYears[newIndex];
            updateDmVisualization();
            updateDmYearNavigation();
        }
    }

    function updateDmYearNavigation() {
        const yearNavigationVisible = !showingAllDmYears;
        dmCurrentYear.textContent = currentDmYear;
        
        if (yearNavigationVisible) {
            dmPrevYear.disabled = currentDmYear === availableYears[0];
            dmNextYear.disabled = currentDmYear === availableYears[availableYears.length - 1];
            dmPrevYear.style.visibility = 'visible';
            dmNextYear.style.visibility = 'visible';
            dmCurrentYear.style.visibility = 'visible';
        } else {
            dmPrevYear.style.visibility = 'hidden';
            dmNextYear.style.visibility = 'hidden';
            dmCurrentYear.style.visibility = 'hidden';
        }
    }

    function toggleAllDmYears() {
        showingAllDmYears = !showingAllDmYears;
        dmAllYearsBtn.textContent = showingAllDmYears ? 'Show Single Year' : 'Show All Years';
        dmAllYearsBtn.classList.toggle('active', showingAllDmYears);
        
        updateDmVisualization();
        updateDmYearNavigation();
    }

    function createDMActivityChart(data) {
        const ctx = document.getElementById('dmActivityChart').getContext('2d');
        
        const chartConfig = {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Daily Messages',
                    data: data.values,
                    backgroundColor: 'rgba(254, 44, 85, 0.6)',
                    borderColor: 'rgba(254, 44, 85, 1)',
                    borderWidth: 1,
                    borderRadius: 2,
                    barPercentage: 0.6,
                    categoryPercentage: 0.7,
                    pointStyle: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2,
                animation: false,
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                },
                hover: {
                    mode: 'nearest',
                    intersect: false,
                    animationDuration: 0
                },
                layout: {
                    padding: {
                        top: 10,
                        right: 10,
                        bottom: 10,
                        left: 10
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Your TikTok Messages',
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        padding: {
                            top: 0,
                            bottom: 10
                        }
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: true,
                        mode: 'nearest',
                        intersect: false,
                        animation: false,
                        callbacks: {
                            title: (context) => {
                                const date = new Date(context[0].raw.x);
                                return date.toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                });
                            },
                            label: (context) => {
                                return `${context.raw.y} messages`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day',
                            displayFormats: {
                                day: 'MMM d'
                            }
                        },
                        title: {
                            display: true,
                            text: 'Date'
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Messages',
                            font: {
                                size: 12
                            }
                        },
                        ticks: {
                            stepSize: 1,
                            maxTicksLimit: 6,
                            font: {
                                size: 11
                            }
                        },
                        grid: {
                            borderDash: [2, 2],
                            drawBorder: false
                        }
                    }
                }
            }
        };

        return new Chart(ctx, chartConfig);
    }

    function createDMUsersChart(data) {
        const ctx = document.getElementById('dmUsersChart').getContext('2d');
        ctx.canvas.style.width = '100%';
        ctx.canvas.style.height = '100%';
        
        const chartConfig = {
            type: 'pie',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    backgroundColor: [
                        'rgba(220, 20, 60, 0.8)',
                        'rgba(255, 99, 132, 0.8)',
                        'rgba(255, 159, 64, 0.8)',
                        'rgba(255, 205, 86, 0.8)',
                        'rgba(75, 192, 192, 0.8)',
                        'rgba(54, 162, 235, 0.8)'
                    ],
                    borderColor: 'white',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            boxWidth: 15,
                            padding: 15,
                            font: {
                                size: 12
                            }
                        }
                    }
                }
            }
        };

        return new Chart(ctx, chartConfig);
    }

    function processProfileData(data) {
        try {
            const profileMap = data?.Profile?.['Profile Information']?.ProfileMap;
            if (!profileMap) return null;

            return {
                username: profileMap.userName || '',
                bio: profileMap.bioDescription || '',
                likesReceived: profileMap.likesReceived || '0'
            };
        } catch (error) {
            console.error('Error processing profile data:', error);
            return null;
        }
    }

    function showHighlights(stats, year) {
        // Get comment and DM stats for the current year
        const commentStats = commentData.statsByYear[year] || { totalComments: 0, avgWordsPerComment: 0 };
        const dmStats = dmData.statsByYear[year] || { totalMessages: 0, uniqueUsers: 0, avgMessageLength: 0 };
        
        // Get username and likesReceived from the correct path
        const profileMap = dmData?.originalData?.Profile?.['Profile Information']?.ProfileMap;
        const username = profileMap?.userName || '';
        const likesReceived = profileMap?.likesReceived || '0';
        
        // Find most messaged person
        const mostMessaged = dmStats.userFrequency ? 
            Object.entries(dmStats.userFrequency)
                .sort(([,a], [,b]) => b - a)[0] : ['No messages', 0];

        // Define message pools for each highlight type
        const messagesByType = {
            interactions: [
                "Wow, you're quite active!",
                "That's a lot of TikTok time!",
                "You really love TikTok, don't you?",
                "Living your best TikTok life!",
                "Now that's what I call dedication!",
                "You're basically a TikTok pro!",
                "That's impressive!",
                "You've been busy this year!",
                "TikTok must love you!",
                "That's some serious dedication!"
            ],
            likes: [
                "Your thumb must be tired!",
                "Spreading the love, I see!",
                "That's a lot of double-taps!",
                "You're quite generous with those likes!",
                "Making creators happy, one like at a time!",
                "Oh... that's too much, isn't it?",
                "Your heart is as big as your like count!",
                "You really know how to show appreciation!",
                "That's a lot of love to give!",
                "Like button's your best friend, huh?"
            ],
            following: [
                "Building quite the community!",
                "Your FYP must be amazing!",
                "That's quite a following spree!",
                "Making friends along the way!",
                "Your feed must be super interesting!",
                "Curious about everything, aren't you?",
                "That's a lot of awesome creators!",
                "You're really expanding your horizons!",
                "Building your own TikTok family!",
                "Never missing out on good content!"
            ],
            effects: [
                "Getting creative with those effects!",
                "Love experimenting, don't you?",
                "You're quite the effects collector!",
                "That's some serious effect game!",
                "Ready for any video situation!",
                "You must make amazing videos!",
                "Effect master in the house!",
                "Your videos must look fantastic!",
                "Always ready with the perfect effect!",
                "That's quite an effects library!"
            ],
            sounds: [
                "You've got quite the playlist!",
                "Music to your ears, right?",
                "That's a lot of bangers!",
                "Your sound collection is fire!",
                "Ready for any sound trend!",
                "DJ TikTok in the house!",
                "Your ears must be happy!",
                "That's quite the sound library!",
                "Never missing a beat!",
                "Sound collector extraordinaire!"
            ],
            favorites: [
                "Saving the best for later!",
                "You've got great taste!",
                "That's quite a collection!",
                "Building your own hall of fame!",
                "Never losing track of the good stuff!",
                "Your favorites must be amazing!",
                "Curator of the finest TikToks!",
                "That's some serious bookmarking!",
                "Your memory box must be full of gems!",
                "Quality content collector!"
            ],
            shares: [
                "Spreading the joy around!",
                "Sharing is caring!",
                "Making everyone's day better!",
                "Your friends must love your shares!",
                "That's the spirit of social media!",
                "Keeping your friends entertained!",
                "Community spirit at its finest!",
                "Sharing the TikTok love!",
                "Your share game is strong!",
                "Making TikTok more social!"
            ],
            watched: [
                "Your eyes must be tired!",
                "That's a lot of scrolling!",
                "Time flies when you're having fun!",
                "TikTok really knows how to keep you watching!",
                "That's some serious screen time!",
                "Can't stop watching, can you?",
                "Just one more video, right?",
                "Your thumb must be tired from scrolling!",
                "FYP got you good!",
                "Living the TikTok life!"
            ],
            comments: [
                "Quite the conversationalist!",
                "Making your voice heard!",
                "Always got something to say!",
                "Engaging with the community!",
                "Your keyboard must be worn out!",
                "Spreading thoughts everywhere!",
                "That's some active participation!",
                "Comment section champion!",
                "Never shy to share your thoughts!",
                "Making TikTok more interactive!"
            ],
            messages: [
                "Social butterfly alert!",
                "Keeping the conversations flowing!",
                "That's a lot of chatting!",
                "Making connections everywhere!",
                "Your message game is strong!",
                "Never missing a chat!",
                "Quite the social networker!",
                "Building relationships one message at a time!",
                "Communication is key!",
                "TikTok's own social star!"
            ]
        };

        // Function to get random message
        const getRandomMessage = (type) => {
            const messages = messagesByType[type];
            return messages[Math.floor(Math.random() * messages.length)];
        };

        const highlights = [
            {
                title: `You did ${stats.totalActivities.toLocaleString()} interactions this year!`,
                value: '🎉',
                message: getRandomMessage('interactions')
            },
            {
                title: `You liked ${stats.likes.toLocaleString()} videos in ${year}!`,
                value: '❤️',
                message: getRandomMessage('likes')
            },
            {
                title: `You followed ${stats.following.toLocaleString()} people this year`,
                value: '👥',
                message: getRandomMessage('following')
            },
            {
                title: `You saved ${stats.favoriteEffects.toLocaleString()} effects this year`,
                value: '✨',
                message: getRandomMessage('effects')
            },
            {
                title: `You saved ${stats.favoriteSounds.toLocaleString()} sounds in ${year}`,
                value: '🎵',
                message: getRandomMessage('sounds')
            },
            {
                title: `You added ${stats.favoriteVideos.toLocaleString()} videos to favourite in ${year}`,
                value: '⭐',
                message: getRandomMessage('favorites')
            },
            {
                title: `You shared ${stats.shares.toLocaleString()} videos this year!`,
                value: '🔄',
                message: getRandomMessage('shares')
            },
            {
                title: `You watched ${stats.videoBrowsing.toLocaleString()} videos in ${year}`,
                value: '📺',
                message: getRandomMessage('watched')
            },
            {
                title: `You commented ${commentStats.totalComments.toLocaleString()} times this year!`,
                value: '💭',
                message: getRandomMessage('comments')
            },
            {
                title: `Average ${Math.round(commentStats.avgWordsPerComment)} words per comment`,
                value: '📝',
                message: "That's quite expressive of you!"
            },
            {
                title: mostMessaged[1] > 0 ? 
                    `Your best friend is ${mostMessaged[0]}!` : 
                    'No messages sent this year',
                value: '👋',
                message: mostMessaged[1] > 0 ? 
                    "You two must have a lot to talk about!" : 
                    "Maybe try sending some messages next year?"
            },
            {
                title: `You messaged ${dmStats.totalMessages.toLocaleString()} times`,
                value: '💌',
                message: getRandomMessage('messages')
            },
            {
                title: `You chatted with ${dmStats.uniqueUsers.toLocaleString()} people this year`,
                value: '🤝',
                message: "Your social circle is growing!"
            },
            {
                title: `Average message length is ${Math.round(dmStats.avgMessageLength)} characters`,
                value: '📨',
                message: "Every character counts!"
            }
        ];

        let currentHighlight = 0;

        function showSummaryScreen() {
            highlightTitle.style.fontSize = '2rem';
            highlightValue.style.display = 'none';
            highlightNext.style.display = 'none';
            
            const summaryHTML = `
                <div class="highlights-summary">
                    <h3>@${username}'s ${year} Wrapped</h3>
                    <div class="summary-stats">
                        <div class="summary-stat">
                            <span class="summary-value">❤️ ${Number(likesReceived).toLocaleString()}</span>
                            <span class="summary-label">Likes Received</span>
                        </div>
                        <div class="summary-stat">
                            <span class="summary-value">👍 ${stats.likes.toLocaleString()}</span>
                            <span class="summary-label">Videos Liked</span>
                        </div>
                        <div class="summary-stat">
                            <span class="summary-value">👀 ${stats.videoBrowsing.toLocaleString()}</span>
                            <span class="summary-label">Videos Watched</span>
                        </div>
                        <div class="summary-stat">
                            <span class="summary-value">💬 ${commentStats.totalComments.toLocaleString()}</span>
                            <span class="summary-label">Comments Made</span>
                        </div>
                        <div class="summary-stat">
                            <span class="summary-value">👥 ${mostMessaged[0]}</span>
                            <span class="summary-label">Best Friend</span>
                        </div>
                        <div class="summary-stat">
                            <span class="summary-value">🎯 ${stats.totalActivities.toLocaleString()}</span>
                            <span class="summary-label">Total Interactions</span>
                        </div>
                    </div>
                    <div class="summary-actions">
                        <button class="continue-to-dashboard" id="continueToDashboard">
                            Continue to Dashboard
                        </button>
                        <div class="share-buttons">
                            <button class="share-button" id="shareButton">
                                Share <span class="share-icon">📤</span>
                            </button>
                            <div class="share-options hidden" id="shareOptions">
                                <button class="share-option instagram" id="shareInstagram">
                                    Download as PNG<span class="share-icon">📸</span>
                                </button>
                                <button class="share-option whatsapp" id="shareWhatsapp">
                                    Share to WhatsApp <span class="share-icon">💬</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            highlightTitle.innerHTML = summaryHTML;

            // Add click event listeners
            document.getElementById('continueToDashboard').addEventListener('click', () => {
                highlightsSection.classList.add('hidden');
                visualizationSection.classList.remove('hidden');
                highlightNext.removeEventListener('click', showNextHighlight);
            });

            // Share button functionality
            const shareButton = document.getElementById('shareButton');
            const shareOptions = document.getElementById('shareOptions');
            const shareInstagram = document.getElementById('shareInstagram');
            const shareWhatsapp = document.getElementById('shareWhatsapp');

            shareButton.addEventListener('click', () => {
                shareOptions.classList.toggle('hidden');
            });

            shareInstagram.addEventListener('click', () => {
                // Hide share options and buttons before capture
                shareOptions.classList.add('hidden');
                shareButton.style.display = 'none';
                document.getElementById('continueToDashboard').style.display = 'none';
                
                // Capture the entire highlights section
                const captureElement = highlightsSection;
                
                html2canvas(captureElement, {
                    backgroundColor: null,
                    scale: 2,
                    logging: true,
                    width: window.innerWidth,
                    height: window.innerHeight,
                    windowWidth: window.innerWidth,
                    windowHeight: window.innerHeight,
                    useCORS: true,
                    allowTaint: true,
                    foreignObjectRendering: true
                }).then(canvas => {
                    // Show the buttons again
                    shareButton.style.display = 'flex';
                    document.getElementById('continueToDashboard').style.display = 'block';
                    shareOptions.classList.remove('hidden');
                    
                    // Create download link
                    const link = document.createElement('a');
                    link.download = `tiktok-wrapped-${year}.png`;
                    link.href = canvas.toDataURL('image/png', 1.0);
                    link.click();
                }).catch(error => {
                    console.error('Error generating image:', error);
                    alert('Error generating image. Please try again.');
                    
                    // Make sure to show the buttons again even if there's an error
                    shareButton.style.display = 'flex';
                    document.getElementById('continueToDashboard').style.display = 'block';
                    shareOptions.classList.remove('hidden');
                });
            });

            shareWhatsapp.addEventListener('click', () => {
                const text = `Check out my TikTok Wrapped ${year}!\n\n` +
                    `👤 @${username}\n` +
                    `❤️ ${Number(likesReceived).toLocaleString()} Likes Received\n` +
                    `👍 ${stats.likes.toLocaleString()} Videos Liked\n` +
                    `👀 ${stats.videoBrowsing.toLocaleString()} Videos Watched\n` +
                    `💬 ${commentStats.totalComments.toLocaleString()} Comments Made\n` +
                    `🎯 ${stats.totalActivities.toLocaleString()} Total Interactions`;
                
                const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
                window.open(whatsappUrl, '_blank');
            });
        }

        function showNextHighlight() {
            if (currentHighlight >= highlights.length) {
                showSummaryScreen();
                return;
            }

            highlightTitle.style.fontSize = '2.5rem';
            highlightValue.style.display = 'block';
            highlightNext.style.display = 'flex'; // Show the continue button for regular highlights
            
            const highlight = highlights[currentHighlight];
            
            // Update the HTML structure to include the message
            highlightTitle.innerHTML = `
                <div class="highlight-main">${highlight.title}</div>
                <div class="highlight-message">${highlight.message}</div>
            `;
            highlightValue.textContent = highlight.value;
            
            // Add animations
            const mainText = highlightTitle.querySelector('.highlight-main');
            const messageText = highlightTitle.querySelector('.highlight-message');
            
            mainText.style.animation = 'slideUp 0.5s ease-out forwards';
            messageText.style.animation = 'slideUp 0.5s ease-out 0.3s forwards';
            highlightValue.style.animation = 'slideUp 0.5s ease-out 0.2s forwards';

            currentHighlight++;
        }

        highlightNext.removeEventListener('click', showNextHighlight);
        highlightNext.addEventListener('click', showNextHighlight);
        
        highlightsSection.classList.remove('hidden');
        showNextHighlight();
    }
}); 