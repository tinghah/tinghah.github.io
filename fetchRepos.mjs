import fs from 'fs';
import https from 'https';

const PAT = process.env.GITHUB_PAT;

function fetchRepos(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Node.js',
        'Authorization': `token ${PAT}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    };
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Failed to fetch: ${res.statusCode} ${data}`));
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  try {
    let page = 1;
    let allRepos = [];
    while (true) {
      const repos = await fetchRepos(`https://api.github.com/user/repos?per_page=100&page=${page}&affiliation=owner,collaborator`);
      if (repos.length === 0) break;
      allRepos = allRepos.concat(repos);
      page++;
    }
    
    // Sort by "hirable" which we can define as most stars, then least recent update, etc.
    // Let's sort by stargazers_count descending, then by updated_at descending.
    allRepos.sort((a, b) => {
      if (b.stargazers_count !== a.stargazers_count) {
        return b.stargazers_count - a.stargazers_count;
      }
      return new Date(b.updated_at) - new Date(a.updated_at);
    });

    const slimRepos = allRepos.map(r => ({
      id: r.id,
      name: r.name,
      description: r.description,
      html_url: r.html_url,
      stargazers_count: r.stargazers_count,
      language: r.language,
      private: r.private,
      topics: r.topics
    }));

    fs.writeFileSync('src/repos.json', JSON.stringify(slimRepos, null, 2));
    console.log(`Saved ${slimRepos.length} repos to src/repos.json`);
  } catch (err) {
    console.error('Error:', err);
  }
}

main();
