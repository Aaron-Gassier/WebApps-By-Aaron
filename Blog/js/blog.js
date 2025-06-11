// Fetch and display articles in the gallery
async function loadArticles() {
    try {
        // Fetch the manifest file that lists all article folders
        const manifestResponse = await fetch('articles/manifest.json');
        if (!manifestResponse.ok) {
            throw new Error('Failed to load article manifest');
        }
        const articleSlugs = await manifestResponse.json();

        const galleryContainer = document.querySelector('.article-gallery');
        galleryContainer.innerHTML = ''; // Clear any existing content

        // For each article slug in the manifest
        for (const slug of articleSlugs) {
            try {
                // Fetch the article's content.json
                const articleResponse = await fetch(`articles/${slug}/content.json`);
                if (!articleResponse.ok) {
                    console.error(`Failed to load article: ${slug}`);
                    continue; // Skip this article if it fails to load
                }
                const article = await articleResponse.json();

                // Create the article card HTML
                const articleCard = document.createElement('div');
                articleCard.className = 'article-item';
                articleCard.innerHTML = `
                    <img src="articles/${slug}/${article.heroImage}" alt="${article.title}" class="article-image">
                    <h3>${article.title}</h3>
                    <p>${article.summary}</p>
                    <a href="article-viewer.html?article=${slug}">Read More</a>
                `;

                // Add the card to the gallery
                galleryContainer.appendChild(articleCard);
            } catch (error) {
                console.error(`Error loading article ${slug}:`, error);
            }
        }
    } catch (error) {
        console.error('Error loading articles:', error);
        document.querySelector('.article-gallery').innerHTML = '<p>Error loading articles. Please try again later.</p>';
    }
}

// Load articles when the page loads
document.addEventListener('DOMContentLoaded', loadArticles);
