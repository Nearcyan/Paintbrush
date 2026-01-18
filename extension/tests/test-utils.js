// Simple test framework for browser-based testing

const TestRunner = {
  results: [],
  currentSuite: null,

  /**
   * Define a test suite
   */
  describe(name, fn) {
    this.currentSuite = name;
    console.log(`\n📦 ${name}`);
    fn();
    this.currentSuite = null;
  },

  /**
   * Define a test
   */
  test(name, fn) {
    const fullName = this.currentSuite ? `${this.currentSuite} > ${name}` : name;
    try {
      fn();
      this.results.push({ name: fullName, pass: true });
      console.log(`  ✅ ${name}`);
    } catch (error) {
      this.results.push({ name: fullName, pass: false, error: error.message });
      console.log(`  ❌ ${name}`);
      console.error(`     ${error.message}`);
    }
  },

  /**
   * Assertion helpers
   */
  assert: {
    equals(actual, expected, msg = '') {
      if (actual !== expected) {
        throw new Error(`${msg}\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`);
      }
    },

    deepEquals(actual, expected, msg = '') {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`${msg}\nExpected: ${JSON.stringify(expected, null, 2)}\nActual: ${JSON.stringify(actual, null, 2)}`);
      }
    },

    includes(array, item, msg = '') {
      if (!array.includes(item)) {
        throw new Error(`${msg}\nExpected array to include: ${JSON.stringify(item)}\nArray: ${JSON.stringify(array)}`);
      }
    },

    notIncludes(array, item, msg = '') {
      if (array.includes(item)) {
        throw new Error(`${msg}\nExpected array NOT to include: ${JSON.stringify(item)}`);
      }
    },

    contains(str, substring, msg = '') {
      if (!str.includes(substring)) {
        throw new Error(`${msg}\nExpected string to contain: "${substring}"\nString: "${str}"`);
      }
    },

    truthy(value, msg = '') {
      if (!value) {
        throw new Error(`${msg}\nExpected truthy value, got: ${JSON.stringify(value)}`);
      }
    },

    falsy(value, msg = '') {
      if (value) {
        throw new Error(`${msg}\nExpected falsy value, got: ${JSON.stringify(value)}`);
      }
    },

    lengthOf(array, length, msg = '') {
      if (array.length !== length) {
        throw new Error(`${msg}\nExpected length ${length}, got ${array.length}`);
      }
    },

    greaterThan(actual, expected, msg = '') {
      if (actual <= expected) {
        throw new Error(`${msg}\nExpected ${actual} > ${expected}`);
      }
    },

    hasProperty(obj, prop, msg = '') {
      if (!(prop in obj)) {
        throw new Error(`${msg}\nExpected object to have property: ${prop}\nObject keys: ${Object.keys(obj).join(', ')}`);
      }
    },
  },

  /**
   * Set up fixture in the DOM
   */
  setFixture(html) {
    const container = document.getElementById('fixture-container');
    container.innerHTML = html;
    container.style.display = 'block';
    return container;
  },

  /**
   * Clear fixture
   */
  clearFixture() {
    const container = document.getElementById('fixture-container');
    container.innerHTML = '';
    container.style.display = 'none';
  },

  /**
   * Render test results to the page
   */
  renderResults() {
    const container = document.getElementById('test-results');
    const summary = document.getElementById('summary');

    const passed = this.results.filter(r => r.pass).length;
    const failed = this.results.filter(r => !r.pass).length;
    const total = this.results.length;

    // Group by suite
    const suites = {};
    this.results.forEach(r => {
      const [suite, name] = r.name.includes(' > ')
        ? r.name.split(' > ')
        : ['Other', r.name];
      if (!suites[suite]) suites[suite] = [];
      suites[suite].push({ ...r, shortName: name });
    });

    let html = '';
    for (const [suiteName, tests] of Object.entries(suites)) {
      html += `<h2>${suiteName}</h2>`;
      for (const test of tests) {
        html += `
          <div class="test ${test.pass ? 'pass' : 'fail'}">
            <span class="test-name">${test.pass ? '✅' : '❌'} ${test.shortName}</span>
            ${test.error ? `<div class="test-detail">${test.error}</div>` : ''}
          </div>
        `;
      }
    }
    container.innerHTML = html;

    summary.className = `summary ${failed > 0 ? 'has-fail' : 'all-pass'}`;
    summary.innerHTML = `
      <strong>${passed}/${total} tests passed</strong>
      ${failed > 0 ? ` (${failed} failed)` : ' 🎉'}
    `;
  },

  /**
   * Run all tests and render results
   */
  run() {
    console.log('🧪 Running Paintbrush Analyzer Tests\n');
    this.renderResults();
  }
};

// Shortcuts
const describe = (name, fn) => TestRunner.describe(name, fn);
const test = (name, fn) => TestRunner.test(name, fn);
const assert = TestRunner.assert;
const setFixture = (html) => TestRunner.setFixture(html);
const clearFixture = () => TestRunner.clearFixture();
