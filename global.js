/*
Step 2 code

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
};

var navLinks = $$('nav a');
var currentLink = navLinks.find(
    (a) => (a.host === location.host) && (a.pathname === location.pathname)
);
currentLink.classList.add('current');

// console.log(navLinks[0].pathname);
console.log(currentLink);

*/
// Set color scheme



// Step 3 - Set up navigation pages
let pages = [
  { url: 'index.html', title: 'Home' },
  { url: 'project2/project2_report.html', title: 'Project 2'},
  { url: 'projects/index.html', title: 'All Projects' },
  { url: 'meta/index.html', title: 'Meta' },
  { url: 'contact/index.html', title: 'Contact'},
  { url: 'resume/index.html', title: 'Resume'},
  { url: 'https://github.com/namtpham26', title: 'Github'}
];
// Check if hosted locally or github
const BASE_PATH =
  location.hostname === 'localhost' || location.hostname === '127.0.0.1'
    ? '/' // Local server
    : '/nam-DSC209R/'; // GitHub Pages repo name
let nav = document.createElement('nav');
document.body.prepend(nav);
for (let p of pages) {
    let url = p.url;
    let title = p.title;
    if (!url.startsWith('http')) {
        url = BASE_PATH + url;
    };
    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;
    nav.append(a);
    if (a.host === location.host && a.pathname === location.pathname) {
        a.classList.add('current');
    };
    if (url.startsWith('http')) {
        a.target = '_blank'
    };
};


// Step 4 - Set up color theme selection
document.body.insertAdjacentHTML(
    'afterbegin',
    `
        <label class = 'color-scheme'>
            Theme:
            <select>
                <option value = 'light dark'>Automatic</option>
                <option value = 'light'>Light</option>
                <option value = 'dark'>Dark</option>
            </select>
        </label>
    `
);
const select = document.querySelector('select');
select.addEventListener('input', function(event) {
    console.log('color scheme changed to', event.target.value)
    localStorage.colorScheme = event.target.value
    document.documentElement.style.setProperty('color-scheme', localStorage.colorScheme)
});

if ('colorScheme' in localStorage) {
    let savedScheme = localStorage.colorScheme;
    document.documentElement.style.setProperty('color-scheme', savedScheme);
    select.value = savedScheme;
};

// Step 5 - deal with contact page
const form = document.querySelector('form');
form?.addEventListener('submit', function(event) {
    event.preventDefault()
    let url = form.action + "?";
    let data = new FormData(form);
    for (let [name, value] of data) {
        // TODO build URL parameters here
        url += name + '=' + encodeURIComponent(value);
        if (name === 'subject') {
            url += '&'
        };
        console.log(url);
    };
    location.href = url;
});

// async import project data 

export async function fetchJSON(url) {
    try {
        // Fetch JSON file from the given URL
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch projects: ${response.statusText}`)
        }
        const data = await response.json()
        return data
    } catch (error_msg) {
        console.error('Error fetching or parsing JSON data:', error_msg)
    } 
};

export function renderProjects(projects, containerElement, headingLevel = 'h2') {
    containerElement.innerHTML = '';
    for (const project of projects) {
        const article = document.createElement('article');
        article.innerHTML = `
            <${headingLevel}>${project.title}</${headingLevel}>
            <img src = "${project.image}" alt = "${project.title}">
            <div>
                <p class = "project-description">${project.description}</p>
                <p class = "project-year">${project.year}</p>
            </div>

        `;
        containerElement.appendChild(article);
    }   
}

export async function fetchGithubData(username) {
    return fetchJSON(`https://api.github.com/users/${username}`);
};