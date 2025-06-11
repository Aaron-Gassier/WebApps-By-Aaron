// Load and display a single article
async function loadArticle() {
    try {
        // Get the article slug from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const articleSlug = urlParams.get('article');
        
        if (!articleSlug) {
            throw new Error('No article specified');
        }

        // Fetch the article's content.json
        const articleResponse = await fetch(`articles/${articleSlug}/content.json`);
        if (!articleResponse.ok) {
            throw new Error('Failed to load article');
        }
        const article = await articleResponse.json();

        // Update the page title
        document.title = article.title;

        // Update the article title
        document.getElementById('article-title').textContent = article.title;

        // Update the article metadata
        document.getElementById('article-meta').innerHTML = `
            By ${article.author.name} | Published on ${new Date(article.publishDate).toLocaleDateString()}
        `;

        // Update the hero image
        const heroImage = document.getElementById('article-hero');
        heroImage.src = `articles/${articleSlug}/${article.heroImage}`;
        heroImage.alt = article.title;
        heroImage.style.display = 'block';

        // Clear and populate the article body
        const articleBody = document.getElementById('article-body');
        articleBody.innerHTML = '';

        // Process each content block
        for (const block of article.coreContent) {
            switch (block.type) {
                case 'paragraph':
                    const p = document.createElement('p');
                    p.textContent = block.text;
                    articleBody.appendChild(p);
                    break;

                case 'heading':
                    const heading = document.createElement(`h${block.level}`);
                    heading.textContent = block.text;
                    articleBody.appendChild(heading);
                    break;

                case 'image':
                    const img = document.createElement('img');
                    img.src = `articles/${articleSlug}/${block.src}`;
                    img.alt = block.alt || '';
                    articleBody.appendChild(img);
                    break;

                case 'audio':
                    const audio = document.createElement('audio');
                    audio.controls = true;
                    audio.src = `articles/${articleSlug}/${block.src}`;
                    articleBody.appendChild(audio);
                    if (block.caption) {
                        const caption = document.createElement('p');
                        caption.textContent = block.caption;
                        caption.style.fontStyle = 'italic';
                        articleBody.appendChild(caption);
                    }
                    break;

                case 'video':
                    const video = document.createElement('video');
                    video.controls = true;
                    video.src = `articles/${articleSlug}/${block.src}`;
                    articleBody.appendChild(video);
                    if (block.caption) {
                        const caption = document.createElement('p');
                        caption.textContent = block.caption;
                        caption.style.fontStyle = 'italic';
                        articleBody.appendChild(caption);
                    }
                    break;

                default:
                    console.warn('Unknown content block type:', block.type);
            }
        }
    } catch (error) {
        console.error('Error loading article:', error);
        document.getElementById('article-title').textContent = 'Error Loading Article';
        document.getElementById('article-body').innerHTML = '<p>Sorry, there was an error loading this article. Please try again later.</p>';
    }
}

// Load the article when the page loads
document.addEventListener('DOMContentLoaded', loadArticle);
