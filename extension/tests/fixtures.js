// Test fixtures mimicking real site structures

const Fixtures = {
  /**
   * X/Twitter-like structure with data-testid attributes
   */
  twitter: `
    <div id="react-root">
      <header role="banner" data-testid="primaryColumn">
        <nav role="navigation" aria-label="Primary">
          <a href="/home" data-testid="AppTabBar_Home_Link">Home</a>
          <a href="/explore" data-testid="AppTabBar_Explore_Link">Explore</a>
        </nav>
      </header>
      <main role="main">
        <div data-testid="primaryColumn">
          <div aria-label="Timeline: Your Home Timeline">
            <article data-testid="tweet" aria-labelledby="tweet-1">
              <div data-testid="User-Name">
                <span>John Doe</span>
                <span data-testid="UserName">@johndoe</span>
              </div>
              <div data-testid="tweetText">Hello world!</div>
              <div role="group" aria-label="Tweet actions">
                <button data-testid="reply" aria-label="Reply">
                  <span>42</span>
                </button>
                <button data-testid="retweet" aria-label="Retweet">
                  <span>128</span>
                </button>
                <button data-testid="like" aria-label="Like">
                  <span>1.2K</span>
                </button>
                <button data-testid="share" aria-label="Share">
                </button>
              </div>
            </article>
            <article data-testid="tweet" aria-labelledby="tweet-2">
              <div data-testid="tweetText">Another tweet</div>
              <div role="group" aria-label="Tweet actions">
                <button data-testid="reply" aria-label="Reply"></button>
                <button data-testid="retweet" aria-label="Retweet"></button>
                <button data-testid="like" aria-label="Like"></button>
              </div>
            </article>
          </div>
        </div>
        <aside aria-label="Trending">
          <div data-testid="sidebarColumn">
            <section aria-labelledby="accessible-list-1">
              <h2 id="accessible-list-1">What's happening</h2>
            </section>
          </div>
        </aside>
      </main>
    </div>
  `,

  /**
   * GitHub-like structure with common patterns
   */
  github: `
    <div class="application-main">
      <header class="Header" role="banner">
        <nav aria-label="Global">
          <a class="header-nav-link" href="/pulls">Pull requests</a>
          <a class="header-nav-link" href="/issues">Issues</a>
        </nav>
        <button class="btn btn-primary" data-testid="create-new">New</button>
      </header>
      <main id="main-content">
        <div class="repository-content">
          <nav aria-label="Repository" data-testid="repo-nav">
            <a class="UnderlineNav-item" data-tab="code" aria-current="page">Code</a>
            <a class="UnderlineNav-item" data-tab="issues">Issues</a>
            <a class="UnderlineNav-item" data-tab="pulls">Pull requests</a>
          </nav>
          <div class="Box">
            <div class="Box-row" data-testid="file-row">
              <a class="Link--primary" href="/src">src</a>
            </div>
            <div class="Box-row" data-testid="file-row">
              <a class="Link--primary" href="/README.md">README.md</a>
            </div>
          </div>
        </div>
        <aside class="BorderGrid-cell" aria-label="About">
          <h2>About</h2>
          <p>Repository description</p>
        </aside>
      </main>
      <footer class="footer" role="contentinfo">
        <span>© GitHub</span>
      </footer>
    </div>
  `,

  /**
   * Generic site with common semantic elements
   */
  generic: `
    <header id="header" class="site-header">
      <nav class="main-nav">
        <a href="/" class="nav-link">Home</a>
        <a href="/about" class="nav-link">About</a>
      </nav>
    </header>
    <main class="main-content">
      <article class="post">
        <h1>Post Title</h1>
        <p>Post content here</p>
        <button class="btn btn-primary">Read More</button>
      </article>
      <aside class="sidebar">
        <div class="card widget">
          <h3>Related Posts</h3>
        </div>
      </aside>
    </main>
    <footer class="site-footer">
      <p>Copyright 2024</p>
    </footer>
  `,

  /**
   * Complex React app with hashed classes but data-testid
   */
  reactApp: `
    <div id="root">
      <div class="css-1dbjc4n r-1awozwy r-18u37iz">
        <header class="css-abc123" role="banner">
          <button class="css-xyz789" data-testid="menu-button" aria-label="Open menu">
            ☰
          </button>
          <div class="css-def456" data-testid="search-box">
            <input type="search" placeholder="Search" aria-label="Search" />
          </div>
        </header>
        <main class="css-main123">
          <div class="css-feed999" data-testid="feed">
            <div class="css-item111" data-testid="feed-item">
              <img src="avatar.jpg" alt="User avatar" />
              <div class="css-content" data-testid="item-content">
                <span class="css-author" data-testid="author">User Name</span>
                <p class="css-text" data-testid="item-text">Content here</p>
              </div>
              <div class="css-actions" data-testid="item-actions">
                <button data-testid="action-like" aria-label="Like">♥</button>
                <button data-testid="action-comment" aria-label="Comment">💬</button>
                <button data-testid="action-share" aria-label="Share">↗</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  `,

  /**
   * Site with CSS variables
   */
  withCssVariables: `
    <style>
      :root {
        --background-color: #1a1a2e;
        --text-color: #eaeaea;
        --primary-color: #e94560;
        --secondary-color: #0f3460;
        --border-radius: 8px;
        --spacing-md: 16px;
      }
      body { background: var(--background-color); color: var(--text-color); }
    </style>
    <div class="app">
      <header style="background: var(--secondary-color)">
        <h1 style="color: var(--primary-color)">Site Title</h1>
      </header>
      <main>
        <button class="btn" style="background: var(--primary-color)">Click me</button>
      </main>
    </div>
  `,

  /**
   * Form-heavy page
   */
  forms: `
    <main>
      <form id="signup-form" aria-label="Sign up form">
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" name="email" class="form-control" placeholder="you@example.com" />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" name="password" class="form-control" />
        </div>
        <div class="form-group">
          <label for="bio">Bio</label>
          <textarea id="bio" name="bio" class="form-control" rows="4"></textarea>
        </div>
        <div class="form-group">
          <label for="country">Country</label>
          <select id="country" name="country" class="form-control">
            <option value="us">United States</option>
            <option value="uk">United Kingdom</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary">Sign Up</button>
        <button type="reset" class="btn btn-secondary">Reset</button>
      </form>
    </main>
  `,

  /**
   * Table-heavy page
   */
  tables: `
    <main>
      <table class="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr data-testid="table-row">
            <td>John Doe</td>
            <td>john@example.com</td>
            <td>Admin</td>
            <td>
              <button class="btn-sm" data-testid="edit-btn" aria-label="Edit John Doe">Edit</button>
              <button class="btn-sm" data-testid="delete-btn" aria-label="Delete John Doe">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </main>
  `,

  // ===========================================
  // NEW FIXTURES FOR ENHANCED DETECTION
  // ===========================================

  /**
   * Tailwind CSS site
   */
  tailwind: `
    <div class="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header class="bg-white shadow-sm">
        <nav class="container mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" class="text-xl font-bold text-gray-800">Logo</a>
          <div class="space-x-4">
            <a href="/about" class="text-gray-600 hover:text-gray-900">About</a>
            <button class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
              Sign Up
            </button>
          </div>
        </nav>
      </header>
      <main class="container mx-auto px-4 py-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <h2 class="text-lg font-semibold mb-2">Card Title</h2>
            <p class="text-gray-600">Card content here</p>
          </div>
        </div>
      </main>
    </div>
  `,

  /**
   * Bootstrap site
   */
  bootstrap: `
    <div class="container-fluid">
      <header class="navbar navbar-expand-lg navbar-light bg-light">
        <a class="navbar-brand" href="#">Brand</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item"><a class="nav-link active" href="#">Home</a></li>
            <li class="nav-item"><a class="nav-link" href="#">About</a></li>
          </ul>
          <button class="btn btn-primary">Sign In</button>
        </div>
      </header>
      <main class="container mt-4">
        <div class="row">
          <div class="col-md-8">
            <div class="card mb-3">
              <div class="card-body">
                <h5 class="card-title">Card title</h5>
                <p class="card-text">Some content</p>
                <a href="#" class="btn btn-outline-primary">Read more</a>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="alert alert-info">Sidebar alert</div>
          </div>
        </div>
      </main>
    </div>
  `,

  /**
   * Site with animations and transitions
   */
  withAnimations: `
    <style>
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      .fade-in { animation: fadeIn 0.3s ease-out; }
      .slide-up { animation: slideUp 0.5s ease-out; }
      .pulse { animation: pulse 2s infinite; }
      .transition-all { transition: all 0.3s ease; }
      .hover-scale:hover { transform: scale(1.02); }
    </style>
    <div class="app">
      <header class="fade-in">
        <h1>Animated Site</h1>
      </header>
      <main>
        <div class="slide-up card">
          <p>This card slides up</p>
        </div>
        <button class="pulse transition-all hover-scale">
          Pulsing Button
        </button>
        <div class="notification" style="transition: opacity 0.2s, transform 0.2s;">
          Notification
        </div>
      </main>
    </div>
  `,

  /**
   * Site with media queries
   */
  withMediaQueries: `
    <style>
      .container { width: 100%; padding: 1rem; }
      @media (min-width: 640px) {
        .container { max-width: 640px; }
        .hide-mobile { display: block; }
      }
      @media (min-width: 768px) {
        .container { max-width: 768px; }
        .grid { grid-template-columns: repeat(2, 1fr); }
      }
      @media (min-width: 1024px) {
        .container { max-width: 1024px; }
        .grid { grid-template-columns: repeat(3, 1fr); }
      }
      @media (min-width: 1280px) {
        .container { max-width: 1280px; }
        .grid { grid-template-columns: repeat(4, 1fr); }
      }
      @media (prefers-color-scheme: dark) {
        body { background: #1a1a1a; color: #fff; }
      }
      @media (prefers-reduced-motion: reduce) {
        * { animation: none !important; transition: none !important; }
      }
    </style>
    <div class="container">
      <div class="grid">
        <div class="card">Card 1</div>
        <div class="card">Card 2</div>
        <div class="card">Card 3</div>
        <div class="card hide-mobile">Card 4 (hidden on mobile)</div>
      </div>
    </div>
  `,

  /**
   * Site with z-index layering
   */
  withLayers: `
    <style>
      .base { position: relative; z-index: 1; }
      .dropdown { position: absolute; z-index: 100; }
      .sticky-header { position: sticky; top: 0; z-index: 500; }
      .modal-backdrop { position: fixed; z-index: 1000; background: rgba(0,0,0,0.5); }
      .modal { position: fixed; z-index: 1050; }
      .tooltip { position: absolute; z-index: 2000; }
      .toast { position: fixed; z-index: 3000; }
    </style>
    <div class="app base">
      <header class="sticky-header" style="z-index: 500;">
        <nav>
          <div class="dropdown" style="z-index: 100;">Dropdown menu</div>
        </nav>
      </header>
      <main>
        <p>Content here</p>
        <span class="tooltip" style="z-index: 2000;">Tooltip</span>
      </main>
      <div class="modal-backdrop" style="z-index: 1000;"></div>
      <div class="modal" role="dialog" style="z-index: 1050;">
        <div class="modal-content">Modal content</div>
      </div>
      <div class="toast" style="z-index: 3000;">Toast notification</div>
    </div>
  `,

  /**
   * Vue.js app structure
   */
  vueApp: `
    <div id="app" data-v-app>
      <div class="v-application" data-v-123abc>
        <header data-v-456def>
          <nav class="v-navigation-drawer">
            <a href="/" class="v-list-item">Home</a>
          </nav>
        </header>
        <main class="v-main" data-v-789ghi>
          <div class="v-container">
            <div class="v-card" data-v-card>
              <div class="v-card__title">Card Title</div>
              <div class="v-card__text">Card content</div>
              <div class="v-card__actions">
                <button class="v-btn v-btn--primary">Action</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  `,

  /**
   * Styled-components / Emotion CSS-in-JS
   */
  styledComponents: `
    <div id="root">
      <div class="sc-AxjAm sc-fzXfLZ kTaHRP">
        <header class="sc-AxirZ sc-fzXfNO jhGRqS">
          <h1 class="sc-AxhCb sc-fzXfMx eiPNGK">Site Title</h1>
        </header>
        <main class="sc-AxhUy sc-fzXfMB dRTPyG">
          <div class="sc-fznMAR sc-fznyAO iAtYKT">
            <button class="sc-fzoJus sc-fznAgC gJBOHu">Click me</button>
          </div>
          <div class="css-1dbjc4n css-175oi2r r-1awozwy">
            <span class="css-901oao css-16my406 r-1qd0xha">Text content</span>
          </div>
        </main>
      </div>
    </div>
  `,

  /**
   * Material UI / MUI app
   */
  materialUI: `
    <div id="root">
      <div class="MuiBox-root">
        <header class="MuiAppBar-root MuiAppBar-colorPrimary MuiAppBar-positionFixed">
          <div class="MuiToolbar-root MuiToolbar-regular">
            <h6 class="MuiTypography-root MuiTypography-h6">App Title</h6>
            <button class="MuiButtonBase-root MuiIconButton-root">
              <span class="MuiIconButton-label">Menu</span>
            </button>
          </div>
        </header>
        <main class="MuiContainer-root MuiContainer-maxWidthLg">
          <div class="MuiPaper-root MuiCard-root MuiPaper-elevation1">
            <div class="MuiCardContent-root">
              <p class="MuiTypography-root MuiTypography-body1">Card content</p>
            </div>
            <div class="MuiCardActions-root">
              <button class="MuiButtonBase-root MuiButton-root MuiButton-contained MuiButton-containedPrimary">
                Action
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  `,

  // ===========================================
  // FIXTURES FOR ELEMENT COVERAGE, SVG, FORMS, COLORS
  // ===========================================

  /**
   * Page with many different element types for coverage testing
   */
  manyElements: `
    <header>
      <nav><a href="/">Home</a></nav>
    </header>
    <main>
      <article>
        <h1>Title</h1>
        <h2>Subtitle</h2>
        <h3>Section</h3>
        <p>Paragraph with <strong>bold</strong>, <em>italic</em>, <code>code</code>, and <mark>highlight</mark>.</p>
        <blockquote>A quote</blockquote>
        <ul><li>List item</li></ul>
        <ol><li>Ordered item</li></ol>
        <dl><dt>Term</dt><dd>Definition</dd></dl>
        <figure><img src="image.jpg" alt="Test"><figcaption>Caption</figcaption></figure>
        <video controls><source src="video.mp4"></video>
        <audio controls><source src="audio.mp3"></audio>
        <pre><code>Code block</code></pre>
        <hr>
        <details><summary>Details</summary><p>Hidden content</p></details>
        <time datetime="2024-01-01">January 1, 2024</time>
        <abbr title="Abbreviation">abbr</abbr>
        <address>123 Main St</address>
        <progress value="50" max="100"></progress>
        <meter value="0.7">70%</meter>
      </article>
      <aside>
        <section>Sidebar section</section>
      </aside>
    </main>
    <footer>
      <small>Copyright 2024</small>
    </footer>
  `,

  /**
   * Page with SVGs and icon fonts
   */
  withSvgIcons: `
    <header>
      <nav>
        <a href="/">
          <svg viewBox="0 0 24 24" class="icon-logo" width="32" height="32">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
          </svg>
          Logo
        </a>
        <button aria-label="Menu">
          <svg viewBox="0 0 24 24" class="icon-menu" width="24" height="24">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </nav>
    </header>
    <main>
      <div class="card">
        <div class="card-icon">
          <svg viewBox="0 0 24 24" width="48" height="48" class="feature-icon">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor"/>
            <path d="M12 6v6l4 2" stroke="currentColor"/>
          </svg>
        </div>
        <h3>Feature</h3>
      </div>
      <div class="actions">
        <button>
          <i class="fa fa-heart"></i> Like
        </button>
        <button>
          <i class="material-icons">share</i> Share
        </button>
        <button>
          <span class="icon icon-download"></span> Download
        </button>
        <button>
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path d="M6 9l6 6 6-6"/>
          </svg>
          Dropdown
        </button>
      </div>
      <div class="inline-svg-sprite" style="display:none">
        <svg xmlns="http://www.w3.org/2000/svg">
          <symbol id="icon-star" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </symbol>
          <symbol id="icon-check" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12"/>
          </symbol>
        </svg>
      </div>
    </main>
  `,

  /**
   * Complex form with all input types
   */
  complexForm: `
    <main>
      <form id="full-form" class="form">
        <fieldset>
          <legend>Personal Information</legend>

          <div class="form-row">
            <label for="name">Full Name</label>
            <input type="text" id="name" name="name" required placeholder="John Doe" autocomplete="name">
          </div>

          <div class="form-row">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required placeholder="john@example.com">
          </div>

          <div class="form-row">
            <label for="phone">Phone</label>
            <input type="tel" id="phone" name="phone" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}">
          </div>

          <div class="form-row">
            <label for="url">Website</label>
            <input type="url" id="url" name="url" placeholder="https://example.com">
          </div>

          <div class="form-row">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" minlength="8">
          </div>

          <div class="form-row">
            <label for="dob">Date of Birth</label>
            <input type="date" id="dob" name="dob">
          </div>

          <div class="form-row">
            <label for="time">Preferred Time</label>
            <input type="time" id="time" name="time">
          </div>

          <div class="form-row">
            <label for="datetime">Appointment</label>
            <input type="datetime-local" id="datetime" name="datetime">
          </div>

          <div class="form-row">
            <label for="age">Age</label>
            <input type="number" id="age" name="age" min="0" max="120">
          </div>

          <div class="form-row">
            <label for="satisfaction">Satisfaction</label>
            <input type="range" id="satisfaction" name="satisfaction" min="0" max="10">
          </div>

          <div class="form-row">
            <label for="color">Favorite Color</label>
            <input type="color" id="color" name="color" value="#ff6600">
          </div>

          <div class="form-row">
            <label for="search">Search</label>
            <input type="search" id="search" name="search" placeholder="Search...">
          </div>

          <div class="form-row">
            <label for="file">Upload File</label>
            <input type="file" id="file" name="file" accept=".pdf,.doc">
          </div>
        </fieldset>

        <fieldset>
          <legend>Preferences</legend>

          <div class="form-row">
            <label for="country">Country</label>
            <select id="country" name="country">
              <optgroup label="North America">
                <option value="us">United States</option>
                <option value="ca">Canada</option>
              </optgroup>
              <optgroup label="Europe">
                <option value="uk">United Kingdom</option>
                <option value="de">Germany</option>
              </optgroup>
            </select>
          </div>

          <div class="form-row">
            <label for="tags">Tags</label>
            <select id="tags" name="tags" multiple>
              <option value="tech">Tech</option>
              <option value="design">Design</option>
              <option value="business">Business</option>
            </select>
          </div>

          <div class="form-row">
            <label for="browser">Browser</label>
            <input list="browsers" id="browser" name="browser">
            <datalist id="browsers">
              <option value="Chrome">
              <option value="Firefox">
              <option value="Safari">
            </datalist>
          </div>

          <div class="form-row">
            <label for="bio">Biography</label>
            <textarea id="bio" name="bio" rows="4" placeholder="Tell us about yourself..."></textarea>
          </div>

          <div class="form-row checkbox-group">
            <label>
              <input type="checkbox" name="newsletter" value="yes"> Subscribe to newsletter
            </label>
            <label>
              <input type="checkbox" name="terms" value="yes" required> Accept terms
            </label>
          </div>

          <div class="form-row radio-group">
            <span>Contact preference:</span>
            <label><input type="radio" name="contact" value="email"> Email</label>
            <label><input type="radio" name="contact" value="phone"> Phone</label>
            <label><input type="radio" name="contact" value="mail"> Mail</label>
          </div>
        </fieldset>

        <fieldset disabled>
          <legend>Disabled Section</legend>
          <input type="text" value="This is disabled">
          <button type="button">Disabled Button</button>
        </fieldset>

        <div class="form-actions">
          <button type="submit" class="btn-primary">Submit</button>
          <button type="reset" class="btn-secondary">Reset</button>
          <button type="button" class="btn-outline" disabled>Disabled</button>
        </div>
      </form>
    </main>
  `,

  /**
   * Page with rich color variety for harmony analysis
   */
  colorHarmony: `
    <style>
      :root {
        --primary: #3b82f6;
        --primary-dark: #1d4ed8;
        --primary-light: #93c5fd;
        --secondary: #10b981;
        --accent: #f59e0b;
        --error: #ef4444;
        --warning: #f97316;
        --success: #22c55e;
        --info: #06b6d4;
        --neutral-50: #fafafa;
        --neutral-100: #f5f5f5;
        --neutral-200: #e5e5e5;
        --neutral-500: #737373;
        --neutral-800: #262626;
        --neutral-900: #171717;
      }
      body { background: var(--neutral-50); color: var(--neutral-900); }
      .header { background: var(--primary); color: white; }
      .header a:hover { background: var(--primary-dark); }
    </style>
    <header class="header" style="background: #3b82f6; color: #ffffff;">
      <nav>
        <a href="/" style="color: #ffffff;">Home</a>
        <a href="/about" style="color: rgba(255,255,255,0.8);">About</a>
      </nav>
    </header>
    <main style="background: #fafafa; color: #171717;">
      <section class="hero" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8);">
        <h1 style="color: #ffffff;">Welcome</h1>
        <p style="color: #93c5fd;">Subtitle text</p>
      </section>
      <div class="cards">
        <div class="card" style="background: #ffffff; border: 1px solid #e5e5e5;">
          <h2 style="color: #262626;">Card Title</h2>
          <p style="color: #737373;">Card description</p>
          <button style="background: #3b82f6; color: #ffffff;">Primary</button>
          <button style="background: #10b981; color: #ffffff;">Success</button>
        </div>
        <div class="card" style="background: #f5f5f5; border: 1px solid #e5e5e5;">
          <span class="badge" style="background: #ef4444; color: #ffffff;">Error</span>
          <span class="badge" style="background: #f97316; color: #ffffff;">Warning</span>
          <span class="badge" style="background: #22c55e; color: #ffffff;">Success</span>
          <span class="badge" style="background: #06b6d4; color: #ffffff;">Info</span>
        </div>
      </div>
      <div class="links">
        <a href="#" style="color: #3b82f6;">Primary link</a>
        <a href="#" style="color: #1d4ed8;">Dark link</a>
        <a href="#" style="color: #10b981;">Green link</a>
      </div>
    </main>
    <footer style="background: #262626; color: #f5f5f5;">
      <p>Footer text</p>
      <a href="#" style="color: #93c5fd;">Footer link</a>
    </footer>
  `,

  /**
   * Page with pseudo-elements (for future live testing)
   */
  withPseudoElements: `
    <style>
      .tooltip::before {
        content: attr(data-tooltip);
        position: absolute;
        background: #333;
        color: white;
        padding: 4px 8px;
      }
      .tooltip::after {
        content: '';
        border: 5px solid transparent;
        border-top-color: #333;
      }
      .required-field::after {
        content: '*';
        color: red;
      }
      .icon-prefix::before {
        content: '▶';
        margin-right: 8px;
      }
      blockquote::before {
        content: '"';
        font-size: 3em;
        color: #ccc;
      }
      .clearfix::after {
        content: '';
        display: table;
        clear: both;
      }
      li::marker {
        color: blue;
      }
      ::selection {
        background: #3b82f6;
        color: white;
      }
      input::placeholder {
        color: #999;
        font-style: italic;
      }
    </style>
    <main>
      <label class="required-field">Email</label>
      <input type="email" placeholder="Enter your email">

      <button class="tooltip" data-tooltip="Click to submit">Submit</button>

      <blockquote>A famous quote</blockquote>

      <ul>
        <li class="icon-prefix">First item</li>
        <li class="icon-prefix">Second item</li>
      </ul>

      <div class="clearfix">
        <div style="float: left;">Left</div>
        <div style="float: right;">Right</div>
      </div>
    </main>
  `,

  /**
   * Page with inherited vs explicit styles for tracking
   */
  inheritedStyles: `
    <style>
      body {
        font-family: 'Georgia', serif;
        font-size: 16px;
        line-height: 1.6;
        color: #333;
        background: #fff;
      }
      .container {
        font-size: 18px;
        color: #222;
      }
      .card {
        background: #f5f5f5;
        padding: 20px;
        /* inherits font-family, line-height from body */
        /* inherits color from .container */
      }
      .card-title {
        font-size: 24px;
        font-weight: bold;
        color: #111;
        /* explicit font-size, color */
        /* inherits font-family, line-height */
      }
      .card-body {
        /* inherits everything from parent chain */
      }
      .highlight {
        background: yellow;
        /* explicit background */
        /* inherits color, font from parent */
      }
      a {
        color: #0066cc;
        text-decoration: underline;
      }
      .nav a {
        color: inherit;
        text-decoration: none;
      }
      code {
        font-family: 'Courier New', monospace;
        font-size: 0.9em;
        background: #eee;
      }
    </style>
    <div class="container">
      <nav class="nav">
        <a href="/">Home</a>
        <a href="/about">About</a>
      </nav>
      <div class="card">
        <h2 class="card-title">Card Title</h2>
        <div class="card-body">
          <p>This paragraph <span class="highlight">inherits styles</span> from its ancestors.</p>
          <p>Here is some <code>inline code</code> with different font.</p>
          <a href="#">A link inside the card</a>
        </div>
      </div>
    </div>
  `,

  /**
   * Page with consistent spacing patterns
   */
  spacingPatterns: `
    <style>
      :root {
        --spacing-xs: 4px;
        --spacing-sm: 8px;
        --spacing-md: 16px;
        --spacing-lg: 24px;
        --spacing-xl: 32px;
        --spacing-2xl: 48px;
      }
      .container { padding: 24px; margin: 0 auto; max-width: 1200px; }
      .section { margin-bottom: 48px; padding: 32px; }
      .card { padding: 16px; margin-bottom: 16px; }
      .card-header { padding-bottom: 8px; margin-bottom: 16px; }
      .card-body { padding: 8px 0; }
      .btn { padding: 8px 16px; margin-right: 8px; }
      .btn-lg { padding: 12px 24px; }
      .btn-sm { padding: 4px 8px; }
      .form-group { margin-bottom: 16px; }
      .form-input { padding: 8px 12px; }
      .list-item { padding: 12px 16px; margin-bottom: 4px; }
      .grid { display: grid; gap: 16px; }
      .flex { display: flex; gap: 8px; }
      .stack { display: flex; flex-direction: column; gap: 16px; }
    </style>
    <div class="container">
      <section class="section">
        <div class="card">
          <div class="card-header">Header</div>
          <div class="card-body">
            <p style="margin-bottom: 16px;">Paragraph</p>
            <div class="flex">
              <button class="btn">Normal</button>
              <button class="btn btn-lg">Large</button>
              <button class="btn btn-sm">Small</button>
            </div>
          </div>
        </div>
        <div class="grid">
          <div class="list-item">Item 1</div>
          <div class="list-item">Item 2</div>
          <div class="list-item">Item 3</div>
        </div>
        <form>
          <div class="form-group">
            <input class="form-input" placeholder="Name">
          </div>
          <div class="form-group">
            <input class="form-input" placeholder="Email">
          </div>
        </form>
      </section>
    </div>
  `,

  /**
   * Page with typography scale
   */
  typographyScale: `
    <style>
      :root {
        --font-size-xs: 12px;
        --font-size-sm: 14px;
        --font-size-base: 16px;
        --font-size-lg: 18px;
        --font-size-xl: 20px;
        --font-size-2xl: 24px;
        --font-size-3xl: 30px;
        --font-size-4xl: 36px;
        --font-size-5xl: 48px;
      }
      body { font-size: 16px; line-height: 1.5; font-family: system-ui, sans-serif; }
      h1 { font-size: 48px; line-height: 1.1; font-weight: 700; letter-spacing: -0.02em; }
      h2 { font-size: 36px; line-height: 1.2; font-weight: 600; letter-spacing: -0.01em; }
      h3 { font-size: 24px; line-height: 1.3; font-weight: 600; }
      h4 { font-size: 20px; line-height: 1.4; font-weight: 500; }
      h5 { font-size: 18px; line-height: 1.4; font-weight: 500; }
      h6 { font-size: 16px; line-height: 1.5; font-weight: 500; }
      p { font-size: 16px; line-height: 1.6; }
      .lead { font-size: 20px; line-height: 1.5; }
      .small { font-size: 14px; }
      .tiny { font-size: 12px; }
      .caption { font-size: 12px; color: #666; }
      .overline { font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; }
      blockquote { font-size: 20px; font-style: italic; line-height: 1.6; }
      code { font-size: 14px; font-family: 'Fira Code', monospace; }
      pre { font-size: 14px; line-height: 1.4; }
    </style>
    <article>
      <span class="overline">Category</span>
      <h1>Main Heading (48px)</h1>
      <p class="lead">This is a lead paragraph with larger text.</p>
      <h2>Section Heading (36px)</h2>
      <p>Regular paragraph text at 16px base size.</p>
      <h3>Subsection (24px)</h3>
      <p>More content here. <span class="small">Small text</span> and <span class="tiny">tiny text</span>.</p>
      <blockquote>A blockquote with larger italic text.</blockquote>
      <h4>Minor Heading (20px)</h4>
      <pre><code>const code = "example";</code></pre>
      <p class="caption">Image caption text</p>
      <h5>Small Heading (18px)</h5>
      <h6>Smallest Heading (16px)</h6>
    </article>
  `,

  /**
   * Page with border and shadow patterns
   */
  borderShadowPatterns: `
    <style>
      :root {
        --radius-sm: 4px;
        --radius-md: 8px;
        --radius-lg: 12px;
        --radius-xl: 16px;
        --radius-full: 9999px;
        --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
        --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
        --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
        --shadow-xl: 0 20px 25px rgba(0,0,0,0.15);
      }
      .card { border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 1px solid #e5e5e5; }
      .card-elevated { border-radius: 12px; box-shadow: 0 10px 15px rgba(0,0,0,0.1); }
      .btn { border-radius: 4px; border: 1px solid #ccc; }
      .btn-rounded { border-radius: 9999px; }
      .btn-square { border-radius: 0; }
      .avatar { border-radius: 9999px; border: 2px solid #fff; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
      .input { border-radius: 4px; border: 1px solid #d1d5db; }
      .input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
      .badge { border-radius: 9999px; }
      .modal { border-radius: 12px; box-shadow: 0 20px 25px rgba(0,0,0,0.15); }
      .dropdown { border-radius: 8px; box-shadow: 0 10px 15px rgba(0,0,0,0.1); border: 1px solid #e5e5e5; }
      .tooltip { border-radius: 4px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
      .divider { border-bottom: 1px solid #e5e5e5; }
      .outline { border: 2px solid #3b82f6; }
      .dashed { border: 1px dashed #9ca3af; border-radius: 8px; }
    </style>
    <div>
      <div class="card" style="border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 1px solid #e5e5e5; padding: 16px; margin-bottom: 16px;">
        <h3>Standard Card</h3>
        <p>With medium shadow and border</p>
      </div>
      <div class="card-elevated" style="border-radius: 12px; box-shadow: 0 10px 15px rgba(0,0,0,0.1); padding: 16px; margin-bottom: 16px;">
        <h3>Elevated Card</h3>
        <p>With large shadow</p>
      </div>
      <div style="display: flex; gap: 8px; margin-bottom: 16px;">
        <button class="btn" style="border-radius: 4px; border: 1px solid #ccc; padding: 8px 16px;">Normal</button>
        <button class="btn-rounded" style="border-radius: 9999px; border: 1px solid #ccc; padding: 8px 16px;">Rounded</button>
        <button class="btn-square" style="border-radius: 0; border: 1px solid #ccc; padding: 8px 16px;">Square</button>
      </div>
      <img class="avatar" src="avatar.jpg" alt="Avatar" style="width: 48px; height: 48px; border-radius: 9999px; border: 2px solid #fff; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
      <div class="divider" style="border-bottom: 1px solid #e5e5e5; margin: 16px 0;"></div>
      <input class="input" style="border-radius: 4px; border: 1px solid #d1d5db; padding: 8px 12px;" placeholder="Input field">
      <div class="dashed" style="border: 1px dashed #9ca3af; border-radius: 8px; padding: 16px; margin-top: 16px;">
        Dashed border container
      </div>
    </div>
  `,
};
