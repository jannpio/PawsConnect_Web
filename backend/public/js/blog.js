document.addEventListener('DOMContentLoaded', async () => {
  const blogContainer = document.querySelector('#blogList');

  // Fetch and display all blogs
  async function fetchBlogs() {
    const res = await fetch('/api/blogs');
    const blogs = await res.json();

    blogContainer.innerHTML = '';
    blogs.forEach(blog => {
      const blogCard = document.createElement('div');
      blogCard.classList.add('col-md-4');
      
      blogCard.innerHTML = `
        <div class="card">
          <img src="images/kitten-care.jpg" alt="Blog Image" class="card-img-top">
          <div class="card-body">
            <h5 class="card-title">${blog.title}</h5>
            <p class="card-text">${blog.content.substring(0, 100)}...</p>
            <button class="btn btn-info">Read More</button>
          </div>
        </div>
      `;
      blogContainer.appendChild(blogCard);
    });
  }

  fetchBlogs();  // Load blogs initially
});
