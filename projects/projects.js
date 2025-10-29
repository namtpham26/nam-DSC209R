import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

const page_title = document.getElementById('page_title');
page_title.innerHTML = `${projects.length} projects`;

// Lab 5 codes //

let selectedIndex = -1; // currently selected pie slice
let query = '';         // current search query
let globalRolledData = d3.rollups(
    projects,
    (v) => v.length,
    (d) => d.year,
    );
let globalData = globalRolledData.map(([year, count]) => {
        return { value: count, label: year };
    });

function getFilteredProjects() {
    return projects
        .filter(p => {
            return selectedIndex === -1 || p.year === globalData[selectedIndex].label;
        })
        .filter(p => {
            return !query || Object.values(p).join('\n').toLowerCase().includes(query.toLowerCase());
        });
}

// Step 4 code: pie chart rendering when page loads and when search
// Refactor all plotting into one function
function renderPieChart(projectsGiven) {
    let colors = d3.scaleOrdinal(d3.schemeTableau10);
    // re-calculate rolled data
    let newRolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year,
    );
    // re-calculate data
    let newData = newRolledData.map(([year, count]) => {
        return { value: count, label: year };
    });
    console.log(newData)
    // re-calculate slice generator, arc data, arc, etc.
    let newArcGenerator = d3.arc().innerRadius(0).outerRadius(50);
    let newSliceGenerator = d3.pie().value((d) => d.value);
    let newArcData = newSliceGenerator(newData);
    let newArcs = newArcData.map((d) => newArcGenerator(d));
    // TODO: clear up paths and legends
    d3.select("svg").selectAll("*").remove();
    d3.select(".legend").selectAll("*").remove();
    // update paths and legends, i.e. render the pie chart
    newArcs.forEach((arc, idx) => {
        d3.select('svg')
        .append('path')
        .attr('d', arc)
        .attr('fill', colors(idx))
    });    
    let newLegend = d3.select('.legend');
    newData.forEach((d, idx) => {
    newLegend.append('li')
        .attr('style', `--color:${colors(idx)}`) // set the style attribute while passing in parameters
        .attr('class', 'legend-item')
        .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // set the inner html of <li>
    });

    // Click handling
    selectedIndex = -1;
    let svg = d3.select('svg');
    svg.selectAll('path').remove();
    newArcs.forEach((arc, i) => {
        svg.append('path')
            .attr('d', arc)
            .attr('fill', colors(i))
            .on('click', () => {
                selectedIndex = selectedIndex === i ? -1 : i;
                svg.selectAll('path') // Re-color the pie
                    .attr('class', (_, idx) => (
                        // TODO: filter idx to find correct pie slice and apply CSS from above
                        idx === selectedIndex ? 'selected' : null
                    ))
                    .attr('opacity', (_, idx) => {
                        if (selectedIndex === -1) return 1;          // nothing selected → all visible
                        return idx === selectedIndex ? 1 : 0.3;      // fade unselected ones
                    });

                d3.selectAll('.legend-item') 
                    .style('opacity', (_, idx) => {
                        if (selectedIndex === -1) return 1;          // nothing selected → all visible
                        return idx === selectedIndex ? 1 : 0.3;      // fade unselected ones
                    })
                    .attr('class', (_, idx) => (
                        idx === selectedIndex ? 'legend-item selected' : 'legend-item'
                    ));                    
                if (selectedIndex === -1) {
                    const filteredProjects = getFilteredProjects();
                    renderProjects(filteredProjects, projectsContainer, 'h2');
                } else {
                    // A slice is selected → get the corresponding year
                    // const selectedYear = newData[selectedIndex].label;

                    // Filter projects for that year
                    const filteredProjects = getFilteredProjects();

                    // Render filtered projects
                    renderProjects(filteredProjects, projectsContainer, 'h2');
                };  
        });
    });
    }
    // Call this function on page load
renderPieChart(projects);

let searchInput = document.querySelector('.searchBar');
searchInput.addEventListener('change', (event) => {
    query = event.target.value; // Comment out to make this a global var for project filtering
    console.log(selectedIndex)
    // let filteredProjects = projects.filter((project) => {
    //     let values = Object.values(project).join('\n').toLowerCase();
    //     return values.includes(query.toLowerCase());
    // });
    let filteredProjects = getFilteredProjects();
    // re-render legends and pie chart when event triggers
    renderProjects(filteredProjects, projectsContainer, 'h2');
    renderPieChart(filteredProjects);
});




