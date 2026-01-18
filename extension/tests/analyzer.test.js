// Analyzer Tests - TDD style
// These tests define expected behavior for new features

// ===========================================
// EXISTING FUNCTIONALITY (sanity checks)
// ===========================================

describe('Analyzer basics', () => {
  test('analyzes colors from DOM elements', async () => {
    setFixture(`
      <div style="background: #ff0000; color: #ffffff;">
        <p style="color: #333333;">Text</p>
      </div>
    `);

    const analysis = await Analyzer.analyze();

    assert.truthy(analysis.colors, 'Should have colors');
    assert.truthy(analysis.colors.backgrounds.length > 0, 'Should find backgrounds');
    assert.truthy(analysis.colors.text.length > 0, 'Should find text colors');

    clearFixture();
  });

  test('detects dark mode', async () => {
    // The fixture container has dark background from test page
    const analysis = await Analyzer.analyze();
    assert.truthy(typeof analysis.colors.isDarkMode === 'boolean', 'Should detect dark mode');
  });

  test('finds structural selectors', async () => {
    setFixture(Fixtures.generic);

    const analysis = await Analyzer.analyze();

    assert.truthy(analysis.selectors.header, 'Should find header');
    assert.truthy(analysis.selectors.nav, 'Should find nav');
    assert.truthy(analysis.selectors.footer, 'Should find footer');

    clearFixture();
  });
});

// ===========================================
// NEW FEATURE: data-testid extraction
// ===========================================

describe('data-testid extraction', () => {
  test('extracts all unique data-testid values', async () => {
    setFixture(Fixtures.twitter);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis, 'testIds', 'Should have testIds property');
    assert.truthy(Array.isArray(analysis.testIds), 'testIds should be an array');
    assert.includes(analysis.testIds, 'tweet', 'Should find tweet testId');
    assert.includes(analysis.testIds, 'reply', 'Should find reply testId');
    assert.includes(analysis.testIds, 'retweet', 'Should find retweet testId');
    assert.includes(analysis.testIds, 'like', 'Should find like testId');

    clearFixture();
  });

  test('deduplicates data-testid values', async () => {
    setFixture(Fixtures.twitter);

    const analysis = await Analyzer.analyze();

    // Twitter fixture has multiple tweets with same testIds
    const replyCount = analysis.testIds.filter(id => id === 'reply').length;
    assert.equals(replyCount, 1, 'Should deduplicate testIds');

    clearFixture();
  });

  test('returns empty array when no data-testid present', async () => {
    setFixture('<div><p>No testids here</p></div>');

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis, 'testIds');
    assert.deepEquals(analysis.testIds, [], 'Should be empty array');

    clearFixture();
  });

  test('groups testIds by element type', async () => {
    setFixture(Fixtures.twitter);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis, 'testIdsByType', 'Should have testIdsByType');
    assert.hasProperty(analysis.testIdsByType, 'button', 'Should have button testIds');
    assert.includes(analysis.testIdsByType.button, 'reply', 'Button testIds should include reply');
    assert.includes(analysis.testIdsByType.button, 'like', 'Button testIds should include like');

    clearFixture();
  });
});

// ===========================================
// NEW FEATURE: aria-label extraction
// ===========================================

describe('aria-label extraction', () => {
  test('extracts aria-labels from interactive elements', async () => {
    setFixture(Fixtures.twitter);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis, 'ariaLabels', 'Should have ariaLabels property');
    assert.truthy(Array.isArray(analysis.ariaLabels), 'ariaLabels should be an array');
    assert.truthy(analysis.ariaLabels.some(a => a.label === 'Reply'), 'Should find Reply aria-label');
    assert.truthy(analysis.ariaLabels.some(a => a.label === 'Like'), 'Should find Like aria-label');

    clearFixture();
  });

  test('includes element type with aria-label', async () => {
    setFixture(Fixtures.twitter);

    const analysis = await Analyzer.analyze();

    const replyLabel = analysis.ariaLabels.find(a => a.label === 'Reply');
    assert.truthy(replyLabel, 'Should find Reply label');
    assert.equals(replyLabel.element, 'button', 'Should include element type');

    clearFixture();
  });

  test('extracts aria-labelledby references', async () => {
    setFixture(Fixtures.github);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis, 'ariaLabels');
    // GitHub fixture has aria-labelledby
    assert.truthy(analysis.ariaLabels.length > 0, 'Should find some labels');

    clearFixture();
  });
});

// ===========================================
// NEW FEATURE: DOM snapshot
// ===========================================

describe('DOM snapshot', () => {
  test('generates simplified DOM structure', async () => {
    setFixture(Fixtures.generic);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis, 'domSnapshot', 'Should have domSnapshot');
    assert.truthy(typeof analysis.domSnapshot === 'string', 'domSnapshot should be a string');
    assert.contains(analysis.domSnapshot, 'header', 'Should contain header');
    assert.contains(analysis.domSnapshot, 'main', 'Should contain main');
    assert.contains(analysis.domSnapshot, 'footer', 'Should contain footer');

    clearFixture();
  });

  test('includes data-testid in snapshot', async () => {
    setFixture(Fixtures.twitter);

    const analysis = await Analyzer.analyze();

    assert.contains(analysis.domSnapshot, 'data-testid="tweet"', 'Should include data-testid');
    assert.contains(analysis.domSnapshot, 'data-testid="reply"', 'Should include button testids');

    clearFixture();
  });

  test('includes role attributes in snapshot', async () => {
    setFixture(Fixtures.twitter);

    const analysis = await Analyzer.analyze();

    assert.contains(analysis.domSnapshot, 'role="banner"', 'Should include role');
    assert.contains(analysis.domSnapshot, 'role="main"', 'Should include main role');

    clearFixture();
  });

  test('limits snapshot depth to prevent huge output', async () => {
    setFixture(Fixtures.twitter);

    const analysis = await Analyzer.analyze();

    // Snapshot should be reasonable size (< 5KB)
    assert.truthy(analysis.domSnapshot.length < 5000, 'Snapshot should be under 5KB');

    clearFixture();
  });

  test('omits text content for privacy/size', async () => {
    setFixture(Fixtures.twitter);

    const analysis = await Analyzer.analyze();

    // Should not include actual tweet text
    assert.truthy(!analysis.domSnapshot.includes('Hello world!'), 'Should not include text content');

    clearFixture();
  });
});

// ===========================================
// NEW FEATURE: Element context/relationships
// ===========================================

describe('Element context', () => {
  test('maps interactive elements to their context', async () => {
    setFixture(Fixtures.twitter);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis, 'elementContext', 'Should have elementContext');
    assert.truthy(Array.isArray(analysis.elementContext), 'elementContext should be array');

    clearFixture();
  });

  test('identifies buttons within tweet actions', async () => {
    setFixture(Fixtures.twitter);

    const analysis = await Analyzer.analyze();

    const actionButtons = analysis.elementContext.filter(
      e => e.testId && ['reply', 'retweet', 'like', 'share'].includes(e.testId)
    );

    assert.truthy(actionButtons.length > 0, 'Should find action buttons');
    // They should have context showing they're in tweet actions
    assert.truthy(
      actionButtons.every(b => b.parentContext && b.parentContext.includes('group')),
      'Action buttons should have group context'
    );

    clearFixture();
  });

  test('captures selector path for elements', async () => {
    setFixture(Fixtures.twitter);

    const analysis = await Analyzer.analyze();

    const replyButton = analysis.elementContext.find(e => e.testId === 'reply');
    assert.truthy(replyButton, 'Should find reply button');
    assert.hasProperty(replyButton, 'selector', 'Should have selector');
    assert.contains(replyButton.selector, 'data-testid="reply"', 'Selector should use data-testid');

    clearFixture();
  });

  test('captures element dimensions', async () => {
    setFixture(`
      <button data-testid="big-btn" style="padding: 20px 40px; font-size: 18px;">Big Button</button>
      <button data-testid="small-btn" style="padding: 4px 8px; font-size: 12px;">Small</button>
    `);

    const analysis = await Analyzer.analyze();

    const bigBtn = analysis.elementContext.find(e => e.testId === 'big-btn');
    const smallBtn = analysis.elementContext.find(e => e.testId === 'small-btn');

    assert.truthy(bigBtn, 'Should find big button');
    assert.truthy(smallBtn, 'Should find small button');
    assert.hasProperty(bigBtn, 'size', 'Should have size info');
    assert.truthy(bigBtn.size.height > smallBtn.size.height, 'Big button should be taller');

    clearFixture();
  });
});

// ===========================================
// INTEGRATION: Full analysis on complex sites
// ===========================================

describe('Integration tests', () => {
  test('Twitter-like site produces rich analysis', async () => {
    setFixture(Fixtures.twitter);

    const analysis = await Analyzer.analyze();

    // Should have all new features
    assert.hasProperty(analysis, 'testIds');
    assert.hasProperty(analysis, 'ariaLabels');
    assert.hasProperty(analysis, 'domSnapshot');
    assert.hasProperty(analysis, 'elementContext');

    // testIds should be useful for targeting
    assert.truthy(analysis.testIds.length >= 5, 'Should find multiple testIds');

    // Element context should help with specific targeting
    const buttons = analysis.elementContext.filter(e => e.element === 'button');
    assert.truthy(buttons.length >= 4, 'Should analyze multiple buttons');

    clearFixture();
  });

  test('GitHub-like site produces rich analysis', async () => {
    setFixture(Fixtures.github);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis, 'testIds');
    assert.includes(analysis.testIds, 'repo-nav', 'Should find GitHub testIds');

    // Should detect structural elements
    assert.truthy(analysis.selectors.header, 'Should find header');
    assert.truthy(analysis.selectors.footer, 'Should find footer');

    clearFixture();
  });

  test('React app with hashed classes still provides useful data', async () => {
    setFixture(Fixtures.reactApp);

    const analysis = await Analyzer.analyze();

    // Even with css-abc123 class names, testIds should work
    assert.includes(analysis.testIds, 'feed', 'Should find feed testId');
    assert.includes(analysis.testIds, 'action-like', 'Should find action testIds');

    // Element context should use testIds for selectors
    const likeBtn = analysis.elementContext.find(e => e.testId === 'action-like');
    assert.truthy(likeBtn, 'Should find like button');
    assert.contains(likeBtn.selector, 'data-testid', 'Should use testId in selector');

    clearFixture();
  });
});

// ===========================================
// NEW FEATURE: Framework/Library Detection
// ===========================================

describe('Framework detection', () => {
  test('detects Tailwind CSS', async () => {
    setFixture(Fixtures.tailwind);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis, 'frameworks', 'Should have frameworks property');
    assert.truthy(analysis.frameworks.tailwind, 'Should detect Tailwind');
    assert.truthy(analysis.frameworks.tailwind.detected, 'Tailwind should be detected');

    clearFixture();
  });

  test('detects Bootstrap', async () => {
    setFixture(Fixtures.bootstrap);

    const analysis = await Analyzer.analyze();

    assert.truthy(analysis.frameworks.bootstrap, 'Should detect Bootstrap');
    assert.truthy(analysis.frameworks.bootstrap.detected, 'Bootstrap should be detected');

    clearFixture();
  });

  test('detects React patterns', async () => {
    setFixture(Fixtures.reactApp);

    const analysis = await Analyzer.analyze();

    assert.truthy(analysis.frameworks.react, 'Should detect React');
    assert.truthy(analysis.frameworks.react.detected, 'React should be detected');

    clearFixture();
  });

  test('detects Vue patterns', async () => {
    setFixture(Fixtures.vueApp);

    const analysis = await Analyzer.analyze();

    assert.truthy(analysis.frameworks.vue, 'Should detect Vue');
    assert.truthy(analysis.frameworks.vue.detected, 'Vue should be detected');

    clearFixture();
  });

  test('detects Material UI', async () => {
    setFixture(Fixtures.materialUI);

    const analysis = await Analyzer.analyze();

    assert.truthy(analysis.frameworks.materialUI, 'Should detect Material UI');
    assert.truthy(analysis.frameworks.materialUI.detected, 'MUI should be detected');

    clearFixture();
  });

  test('returns useful selectors for detected frameworks', async () => {
    setFixture(Fixtures.bootstrap);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis.frameworks.bootstrap, 'selectors', 'Should have framework selectors');
    assert.truthy(analysis.frameworks.bootstrap.selectors.length > 0, 'Should have some selectors');

    clearFixture();
  });
});

// ===========================================
// NEW FEATURE: Media Query Extraction
// ===========================================

describe('Media query extraction', () => {
  test('extracts breakpoints from stylesheets', async () => {
    setFixture(Fixtures.withMediaQueries);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis, 'mediaQueries', 'Should have mediaQueries');
    assert.hasProperty(analysis.mediaQueries, 'breakpoints', 'Should have breakpoints');
    assert.truthy(analysis.mediaQueries.breakpoints.length > 0, 'Should find breakpoints');

    clearFixture();
  });

  test('identifies common breakpoint values', async () => {
    setFixture(Fixtures.withMediaQueries);

    const analysis = await Analyzer.analyze();

    // Should find standard breakpoints
    assert.truthy(
      analysis.mediaQueries.breakpoints.some(bp => bp.includes('768')),
      'Should find 768px breakpoint'
    );

    clearFixture();
  });

  test('detects prefers-color-scheme', async () => {
    setFixture(Fixtures.withMediaQueries);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis.mediaQueries, 'features', 'Should have features');
    assert.truthy(
      analysis.mediaQueries.features.prefersColorScheme,
      'Should detect prefers-color-scheme'
    );

    clearFixture();
  });

  test('detects prefers-reduced-motion', async () => {
    setFixture(Fixtures.withMediaQueries);

    const analysis = await Analyzer.analyze();

    assert.truthy(
      analysis.mediaQueries.features.prefersReducedMotion,
      'Should detect prefers-reduced-motion'
    );

    clearFixture();
  });
});

// ===========================================
// NEW FEATURE: Animation/Transition Detection
// ===========================================

describe('Animation detection', () => {
  test('extracts keyframe animation names', async () => {
    setFixture(Fixtures.withAnimations);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis, 'animations', 'Should have animations');
    assert.hasProperty(analysis.animations, 'keyframes', 'Should have keyframes');
    assert.truthy(analysis.animations.keyframes.length > 0, 'Should find keyframes');
    assert.includes(analysis.animations.keyframes, 'fadeIn', 'Should find fadeIn');
    assert.includes(analysis.animations.keyframes, 'slideUp', 'Should find slideUp');

    clearFixture();
  });

  test('detects elements with transitions', async () => {
    setFixture(Fixtures.withAnimations);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis.animations, 'hasTransitions', 'Should track transitions');
    assert.truthy(analysis.animations.hasTransitions, 'Should detect transitions');

    clearFixture();
  });

  test('identifies animated elements', async () => {
    setFixture(Fixtures.withAnimations);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis.animations, 'animatedElements', 'Should list animated elements');
    assert.truthy(analysis.animations.animatedElements.length > 0, 'Should find animated elements');

    clearFixture();
  });
});

// ===========================================
// NEW FEATURE: Shadow DOM Detection
// ===========================================

describe('Shadow DOM detection', () => {
  test('detects shadow roots in the page', async () => {
    // Create an element with shadow DOM for this test
    const container = setFixture('<div id="shadow-host"></div>');
    const host = container.querySelector('#shadow-host');
    const shadow = host.attachShadow({ mode: 'open' });
    shadow.innerHTML = '<div class="shadow-content"><button>Shadow Button</button></div>';

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis, 'shadowDOM', 'Should have shadowDOM property');
    assert.truthy(analysis.shadowDOM.detected, 'Should detect shadow DOM');
    assert.truthy(analysis.shadowDOM.count > 0, 'Should count shadow roots');

    clearFixture();
  });

  test('returns false when no shadow DOM present', async () => {
    setFixture(Fixtures.generic);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis, 'shadowDOM');
    assert.truthy(!analysis.shadowDOM.detected, 'Should not detect shadow DOM');

    clearFixture();
  });
});

// ===========================================
// NEW FEATURE: CSS-in-JS Detection
// ===========================================

describe('CSS-in-JS detection', () => {
  test('detects styled-components patterns', async () => {
    setFixture(Fixtures.styledComponents);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis, 'cssInJs', 'Should have cssInJs');
    assert.truthy(analysis.cssInJs.detected, 'Should detect CSS-in-JS');
    assert.truthy(
      analysis.cssInJs.patterns.includes('styled-components') ||
      analysis.cssInJs.patterns.includes('emotion'),
      'Should identify styled-components or emotion'
    );

    clearFixture();
  });

  test('detects CSS modules / hashed classes', async () => {
    setFixture(Fixtures.reactApp);

    const analysis = await Analyzer.analyze();

    assert.truthy(analysis.cssInJs.detected, 'Should detect CSS-in-JS');
    assert.hasProperty(analysis.cssInJs, 'hashedClassCount', 'Should count hashed classes');
    assert.truthy(analysis.cssInJs.hashedClassCount > 0, 'Should find hashed classes');

    clearFixture();
  });

  test('suggests using data-testid when CSS-in-JS detected', async () => {
    setFixture(Fixtures.reactApp);

    const analysis = await Analyzer.analyze();

    assert.truthy(
      analysis.cssInJs.recommendation === 'use-testid' ||
      analysis.cssInJs.recommendation === 'use-stable-selectors',
      'Should recommend stable selectors'
    );

    clearFixture();
  });
});

// ===========================================
// NEW FEATURE: Z-index Layer Map
// ===========================================

describe('Z-index layer map', () => {
  test('extracts z-index values from page', async () => {
    setFixture(Fixtures.withLayers);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis, 'layers', 'Should have layers');
    assert.hasProperty(analysis.layers, 'values', 'Should have layer values');
    assert.truthy(Object.keys(analysis.layers.values).length > 0, 'Should find z-index values');

    clearFixture();
  });

  test('identifies layer categories', async () => {
    setFixture(Fixtures.withLayers);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis.layers, 'categories', 'Should categorize layers');
    // Should identify common layer categories
    assert.truthy(
      analysis.layers.categories.modal !== undefined ||
      analysis.layers.categories.dropdown !== undefined ||
      analysis.layers.categories.tooltip !== undefined,
      'Should identify layer categories'
    );

    clearFixture();
  });

  test('determines max z-index', async () => {
    setFixture(Fixtures.withLayers);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis.layers, 'max', 'Should have max z-index');
    assert.truthy(analysis.layers.max >= 1000, 'Max should be significant');

    clearFixture();
  });

  test('identifies stacking context roots', async () => {
    setFixture(Fixtures.withLayers);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis.layers, 'stackingContexts', 'Should identify stacking contexts');

    clearFixture();
  });
});

// ===========================================
// NEW FEATURE: Complete Element Coverage
// ===========================================

describe('Complete element coverage', () => {
  test('detects all unique element types on page', async () => {
    setFixture(Fixtures.manyElements);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis, 'elementTypes', 'Should have elementTypes');
    assert.truthy(Array.isArray(analysis.elementTypes), 'Should be array');
    assert.truthy(analysis.elementTypes.length > 10, 'Should find many element types');

    clearFixture();
  });

  test('includes semantic elements', async () => {
    setFixture(Fixtures.manyElements);

    const analysis = await Analyzer.analyze();

    assert.includes(analysis.elementTypes, 'article', 'Should find article');
    assert.includes(analysis.elementTypes, 'aside', 'Should find aside');
    assert.includes(analysis.elementTypes, 'section', 'Should find section');
    assert.includes(analysis.elementTypes, 'figure', 'Should find figure');
    assert.includes(analysis.elementTypes, 'figcaption', 'Should find figcaption');

    clearFixture();
  });

  test('includes typography elements', async () => {
    setFixture(Fixtures.manyElements);

    const analysis = await Analyzer.analyze();

    assert.includes(analysis.elementTypes, 'h1', 'Should find h1');
    assert.includes(analysis.elementTypes, 'h2', 'Should find h2');
    assert.includes(analysis.elementTypes, 'blockquote', 'Should find blockquote');
    assert.includes(analysis.elementTypes, 'pre', 'Should find pre');
    assert.includes(analysis.elementTypes, 'code', 'Should find code');

    clearFixture();
  });

  test('includes interactive elements', async () => {
    setFixture(Fixtures.manyElements);

    const analysis = await Analyzer.analyze();

    assert.includes(analysis.elementTypes, 'details', 'Should find details');
    assert.includes(analysis.elementTypes, 'summary', 'Should find summary');
    assert.includes(analysis.elementTypes, 'progress', 'Should find progress');
    assert.includes(analysis.elementTypes, 'meter', 'Should find meter');

    clearFixture();
  });

  test('counts element occurrences', async () => {
    setFixture(Fixtures.manyElements);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis, 'elementCounts', 'Should have elementCounts');
    assert.truthy(analysis.elementCounts.li >= 2, 'Should count multiple li elements');

    clearFixture();
  });

  test('groups elements by category', async () => {
    setFixture(Fixtures.manyElements);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis, 'elementCategories', 'Should have elementCategories');
    assert.hasProperty(analysis.elementCategories, 'typography', 'Should have typography category');
    assert.hasProperty(analysis.elementCategories, 'media', 'Should have media category');
    assert.hasProperty(analysis.elementCategories, 'interactive', 'Should have interactive category');
    assert.hasProperty(analysis.elementCategories, 'semantic', 'Should have semantic category');

    clearFixture();
  });
});

// ===========================================
// NEW FEATURE: SVG/Icon Handling
// ===========================================

describe('SVG and icon detection', () => {
  test('detects inline SVGs', async () => {
    setFixture(Fixtures.withSvgIcons);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis, 'icons', 'Should have icons property');
    assert.hasProperty(analysis.icons, 'svgs', 'Should have svgs');
    assert.truthy(analysis.icons.svgs.count > 0, 'Should find SVGs');

    clearFixture();
  });

  test('identifies SVG sizes', async () => {
    setFixture(Fixtures.withSvgIcons);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis.icons.svgs, 'sizes', 'Should track SVG sizes');
    assert.truthy(analysis.icons.svgs.sizes.length > 0, 'Should find different sizes');

    clearFixture();
  });

  test('detects icon fonts', async () => {
    setFixture(Fixtures.withSvgIcons);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis.icons, 'fonts', 'Should have fonts');
    assert.truthy(analysis.icons.fonts.detected, 'Should detect icon fonts');
    assert.truthy(analysis.icons.fonts.classes.length > 0, 'Should find icon font classes');

    clearFixture();
  });

  test('identifies common icon font libraries', async () => {
    setFixture(Fixtures.withSvgIcons);

    const analysis = await Analyzer.analyze();

    assert.truthy(
      analysis.icons.fonts.libraries.includes('font-awesome') ||
      analysis.icons.fonts.libraries.includes('material-icons'),
      'Should identify icon libraries'
    );

    clearFixture();
  });

  test('detects SVG sprite usage', async () => {
    setFixture(Fixtures.withSvgIcons);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis.icons.svgs, 'hasSprite', 'Should check for sprites');
    assert.truthy(analysis.icons.svgs.hasSprite, 'Should detect SVG sprite');

    clearFixture();
  });

  test('provides SVG styling recommendations', async () => {
    setFixture(Fixtures.withSvgIcons);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis.icons, 'recommendations', 'Should have recommendations');
    assert.truthy(Array.isArray(analysis.icons.recommendations), 'Should be array');

    clearFixture();
  });
});

// ===========================================
// NEW FEATURE: Enhanced Form Element Styling
// ===========================================

describe('Enhanced form element detection', () => {
  test('detects all input types', async () => {
    setFixture(Fixtures.complexForm);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis, 'forms', 'Should have forms');
    assert.hasProperty(analysis.forms, 'inputTypes', 'Should have inputTypes');
    assert.truthy(analysis.forms.inputTypes.length > 5, 'Should find many input types');

    clearFixture();
  });

  test('includes all HTML5 input types found', async () => {
    setFixture(Fixtures.complexForm);

    const analysis = await Analyzer.analyze();

    assert.includes(analysis.forms.inputTypes, 'email', 'Should find email');
    assert.includes(analysis.forms.inputTypes, 'password', 'Should find password');
    assert.includes(analysis.forms.inputTypes, 'date', 'Should find date');
    assert.includes(analysis.forms.inputTypes, 'range', 'Should find range');
    assert.includes(analysis.forms.inputTypes, 'color', 'Should find color');
    assert.includes(analysis.forms.inputTypes, 'file', 'Should find file');

    clearFixture();
  });

  test('detects form element states', async () => {
    setFixture(Fixtures.complexForm);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis.forms, 'states', 'Should have states');
    assert.truthy(analysis.forms.states.hasRequired, 'Should detect required fields');
    assert.truthy(analysis.forms.states.hasDisabled, 'Should detect disabled fields');

    clearFixture();
  });

  test('detects fieldsets and legends', async () => {
    setFixture(Fixtures.complexForm);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis.forms, 'structure', 'Should have structure');
    assert.truthy(analysis.forms.structure.hasFieldsets, 'Should detect fieldsets');
    assert.truthy(analysis.forms.structure.hasLegends, 'Should detect legends');

    clearFixture();
  });

  test('detects select elements with options', async () => {
    setFixture(Fixtures.complexForm);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis.forms, 'selects', 'Should have selects');
    assert.truthy(analysis.forms.selects.count > 0, 'Should find selects');
    assert.truthy(analysis.forms.selects.hasOptgroups, 'Should detect optgroups');
    assert.truthy(analysis.forms.selects.hasMultiple, 'Should detect multiple select');

    clearFixture();
  });

  test('detects radio and checkbox groups', async () => {
    setFixture(Fixtures.complexForm);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis.forms, 'groups', 'Should have groups');
    assert.truthy(analysis.forms.groups.radioGroups > 0, 'Should find radio groups');
    assert.truthy(analysis.forms.groups.checkboxCount > 0, 'Should find checkboxes');

    clearFixture();
  });

  test('detects datalists', async () => {
    setFixture(Fixtures.complexForm);

    const analysis = await Analyzer.analyze();

    assert.truthy(analysis.forms.hasDatalist, 'Should detect datalist');

    clearFixture();
  });

  test('provides form selectors for styling', async () => {
    setFixture(Fixtures.complexForm);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis.forms, 'selectors', 'Should have selectors');
    assert.truthy(analysis.forms.selectors.length > 0, 'Should provide selectors');

    clearFixture();
  });
});

// ===========================================
// NEW FEATURE: Color Harmony Analysis
// ===========================================

describe('Color harmony analysis', () => {
  test('groups colors by role', async () => {
    setFixture(Fixtures.colorHarmony);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis, 'colorAnalysis', 'Should have colorAnalysis');
    assert.hasProperty(analysis.colorAnalysis, 'roles', 'Should have roles');
    assert.hasProperty(analysis.colorAnalysis.roles, 'primary', 'Should identify primary');
    assert.hasProperty(analysis.colorAnalysis.roles, 'background', 'Should identify background');
    assert.hasProperty(analysis.colorAnalysis.roles, 'text', 'Should identify text');

    clearFixture();
  });

  test('detects color palette relationships', async () => {
    setFixture(Fixtures.colorHarmony);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis.colorAnalysis, 'palette', 'Should have palette');
    assert.truthy(analysis.colorAnalysis.palette.length > 0, 'Should find palette colors');

    clearFixture();
  });

  test('identifies accent/highlight colors', async () => {
    setFixture(Fixtures.colorHarmony);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis.colorAnalysis.roles, 'accent', 'Should have accent colors');

    clearFixture();
  });

  test('detects semantic colors (success, error, warning, info)', async () => {
    setFixture(Fixtures.colorHarmony);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis.colorAnalysis, 'semantic', 'Should have semantic');
    assert.hasProperty(analysis.colorAnalysis.semantic, 'success', 'Should find success');
    assert.hasProperty(analysis.colorAnalysis.semantic, 'error', 'Should find error');
    assert.hasProperty(analysis.colorAnalysis.semantic, 'warning', 'Should find warning');

    clearFixture();
  });

  test('calculates contrast ratios', async () => {
    setFixture(Fixtures.colorHarmony);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis.colorAnalysis, 'contrast', 'Should have contrast');
    assert.hasProperty(analysis.colorAnalysis.contrast, 'issues', 'Should check issues');

    clearFixture();
  });

  test('identifies color scheme type', async () => {
    setFixture(Fixtures.colorHarmony);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis.colorAnalysis, 'scheme', 'Should identify scheme');
    // Should be something like 'monochromatic', 'complementary', 'analogous', etc.
    assert.truthy(
      ['monochromatic', 'complementary', 'analogous', 'triadic', 'split-complementary', 'mixed'].includes(
        analysis.colorAnalysis.scheme
      ),
      'Should be a valid scheme type'
    );

    clearFixture();
  });

  test('provides dominant colors', async () => {
    setFixture(Fixtures.colorHarmony);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis.colorAnalysis, 'dominant', 'Should have dominant');
    assert.truthy(analysis.colorAnalysis.dominant.length > 0, 'Should find dominant colors');
    assert.truthy(analysis.colorAnalysis.dominant.length <= 5, 'Should limit to top 5');

    clearFixture();
  });
});

// ===========================================
// INTEGRATION: Full analysis with new features
// ===========================================

describe('Enhanced integration tests', () => {
  test('Tailwind site gets full analysis with framework info', async () => {
    setFixture(Fixtures.tailwind);

    const analysis = await Analyzer.analyze();

    // Original features still work
    assert.hasProperty(analysis, 'colors');
    assert.hasProperty(analysis, 'selectors');

    // New features present
    assert.hasProperty(analysis, 'frameworks');
    assert.truthy(analysis.frameworks.tailwind.detected);

    clearFixture();
  });

  test('Complex animated site detects all features', async () => {
    setFixture(Fixtures.withAnimations);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis, 'animations');
    assert.truthy(analysis.animations.keyframes.length >= 2);

    clearFixture();
  });

  test('Page with many elements provides complete coverage', async () => {
    setFixture(Fixtures.manyElements);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis, 'elementTypes');
    assert.hasProperty(analysis, 'elementCategories');
    assert.truthy(analysis.elementTypes.length > 15, 'Should find many element types');

    clearFixture();
  });

  test('Complex form provides comprehensive form analysis', async () => {
    setFixture(Fixtures.complexForm);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis, 'forms');
    assert.truthy(analysis.forms.inputTypes.length > 8, 'Should find many input types');
    assert.truthy(analysis.forms.states.hasRequired);
    assert.truthy(analysis.forms.structure.hasFieldsets);

    clearFixture();
  });

  test('Color-rich page provides harmony analysis', async () => {
    setFixture(Fixtures.colorHarmony);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis, 'colorAnalysis');
    assert.hasProperty(analysis.colorAnalysis, 'roles');
    assert.hasProperty(analysis.colorAnalysis, 'semantic');
    assert.truthy(analysis.colorAnalysis.palette.length > 3);

    clearFixture();
  });
});

// ===========================================
// NEW FEATURE: Pseudo-Element Detection
// ===========================================

describe('Pseudo-element detection', () => {
  test('detects elements with ::before pseudo-elements', async () => {
    setFixture(Fixtures.withPseudoElements);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis, 'pseudoElements', 'Should have pseudoElements');
    assert.hasProperty(analysis.pseudoElements, 'before', 'Should have before');
    assert.truthy(analysis.pseudoElements.before.length > 0, 'Should find ::before elements');

    clearFixture();
  });

  test('detects elements with ::after pseudo-elements', async () => {
    setFixture(Fixtures.withPseudoElements);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis.pseudoElements, 'after', 'Should have after');
    assert.truthy(analysis.pseudoElements.after.length > 0, 'Should find ::after elements');

    clearFixture();
  });

  test('identifies pseudo-element selectors for styling', async () => {
    setFixture(Fixtures.withPseudoElements);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis.pseudoElements, 'selectors', 'Should have selectors');
    assert.truthy(analysis.pseudoElements.selectors.length > 0, 'Should provide selectors');

    clearFixture();
  });

  test('detects placeholder styling', async () => {
    setFixture(Fixtures.withPseudoElements);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis.pseudoElements, 'hasPlaceholders', 'Should check placeholders');
    assert.truthy(analysis.pseudoElements.hasPlaceholders, 'Should detect placeholder inputs');

    clearFixture();
  });

  test('provides pseudo-element count summary', async () => {
    setFixture(Fixtures.withPseudoElements);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis.pseudoElements, 'count', 'Should have count');
    assert.truthy(analysis.pseudoElements.count > 0, 'Should count pseudo-elements');

    clearFixture();
  });
});

// ===========================================
// NEW FEATURE: Inherited Style Tracking
// ===========================================

describe('Inherited style tracking', () => {
  test('identifies inherited vs explicit properties', async () => {
    setFixture(Fixtures.inheritedStyles);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis, 'styleInheritance', 'Should have styleInheritance');
    assert.hasProperty(analysis.styleInheritance, 'inherited', 'Should track inherited');
    assert.hasProperty(analysis.styleInheritance, 'explicit', 'Should track explicit');

    clearFixture();
  });

  test('tracks font inheritance chain', async () => {
    setFixture(Fixtures.inheritedStyles);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis.styleInheritance, 'fontChain', 'Should have fontChain');
    assert.truthy(analysis.styleInheritance.fontChain.length > 0, 'Should find font chain');

    clearFixture();
  });

  test('identifies color inheritance patterns', async () => {
    setFixture(Fixtures.inheritedStyles);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis.styleInheritance, 'colorInheritance', 'Should track color inheritance');

    clearFixture();
  });

  test('detects elements using inherit keyword', async () => {
    setFixture(Fixtures.inheritedStyles);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis.styleInheritance, 'usesInherit', 'Should check inherit keyword');

    clearFixture();
  });

  test('provides root style cascade info', async () => {
    setFixture(Fixtures.inheritedStyles);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis.styleInheritance, 'rootStyles', 'Should have rootStyles');
    assert.hasProperty(analysis.styleInheritance.rootStyles, 'fontFamily', 'Should track root fontFamily');
    assert.hasProperty(analysis.styleInheritance.rootStyles, 'color', 'Should track root color');
    assert.hasProperty(analysis.styleInheritance.rootStyles, 'lineHeight', 'Should track root lineHeight');

    clearFixture();
  });
});

// ===========================================
// NEW FEATURE: Spacing Pattern Detection
// ===========================================

describe('Spacing pattern detection', () => {
  test('detects common padding values', async () => {
    setFixture(Fixtures.spacingPatterns);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis, 'spacing', 'Should have spacing');
    assert.hasProperty(analysis.spacing, 'padding', 'Should have padding values');
    assert.truthy(analysis.spacing.padding.length > 0, 'Should find padding values');

    clearFixture();
  });

  test('detects common margin values', async () => {
    setFixture(Fixtures.spacingPatterns);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis.spacing, 'margin', 'Should have margin values');
    assert.truthy(analysis.spacing.margin.length > 0, 'Should find margin values');

    clearFixture();
  });

  test('detects gap values in flex/grid', async () => {
    setFixture(Fixtures.spacingPatterns);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis.spacing, 'gap', 'Should have gap values');
    assert.truthy(analysis.spacing.gap.length > 0, 'Should find gap values');

    clearFixture();
  });

  test('identifies spacing scale/system', async () => {
    setFixture(Fixtures.spacingPatterns);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis.spacing, 'scale', 'Should identify spacing scale');
    assert.truthy(analysis.spacing.scale.length > 0, 'Should find scale values');

    clearFixture();
  });

  test('provides common spacing values sorted by frequency', async () => {
    setFixture(Fixtures.spacingPatterns);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis.spacing, 'common', 'Should have common values');
    assert.truthy(analysis.spacing.common.length > 0, 'Should list common values');

    clearFixture();
  });
});

// ===========================================
// NEW FEATURE: Typography Scale Detection
// ===========================================

describe('Typography scale detection', () => {
  test('detects heading font sizes', async () => {
    setFixture(Fixtures.typographyScale);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis, 'typographyScale', 'Should have typographyScale');
    assert.hasProperty(analysis.typographyScale, 'headings', 'Should have headings');
    assert.truthy(Object.keys(analysis.typographyScale.headings).length > 0, 'Should find heading sizes');

    clearFixture();
  });

  test('detects base/body font size', async () => {
    setFixture(Fixtures.typographyScale);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis.typographyScale, 'base', 'Should have base size');
    assert.truthy(analysis.typographyScale.base, 'Should find base font size');

    clearFixture();
  });

  test('detects line height patterns', async () => {
    setFixture(Fixtures.typographyScale);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis.typographyScale, 'lineHeights', 'Should have lineHeights');
    assert.truthy(analysis.typographyScale.lineHeights.length > 0, 'Should find line heights');

    clearFixture();
  });

  test('detects font weight patterns', async () => {
    setFixture(Fixtures.typographyScale);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis.typographyScale, 'fontWeights', 'Should have fontWeights');
    assert.truthy(analysis.typographyScale.fontWeights.length > 0, 'Should find font weights');

    clearFixture();
  });

  test('calculates scale ratio', async () => {
    setFixture(Fixtures.typographyScale);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis.typographyScale, 'ratio', 'Should calculate ratio');

    clearFixture();
  });

  test('detects letter spacing patterns', async () => {
    setFixture(Fixtures.typographyScale);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis.typographyScale, 'letterSpacing', 'Should have letterSpacing');

    clearFixture();
  });
});

// ===========================================
// NEW FEATURE: Border/Shadow Pattern Detection
// ===========================================

describe('Border and shadow pattern detection', () => {
  test('detects border-radius values', async () => {
    setFixture(Fixtures.borderShadowPatterns);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis, 'borderShadow', 'Should have borderShadow');
    assert.hasProperty(analysis.borderShadow, 'borderRadius', 'Should have borderRadius');
    assert.truthy(analysis.borderShadow.borderRadius.length > 0, 'Should find border-radius values');

    clearFixture();
  });

  test('detects box-shadow patterns', async () => {
    setFixture(Fixtures.borderShadowPatterns);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis.borderShadow, 'boxShadow', 'Should have boxShadow');
    assert.truthy(analysis.borderShadow.boxShadow.length > 0, 'Should find box-shadow values');

    clearFixture();
  });

  test('detects border styles', async () => {
    setFixture(Fixtures.borderShadowPatterns);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis.borderShadow, 'borderStyles', 'Should have borderStyles');

    clearFixture();
  });

  test('detects border colors', async () => {
    setFixture(Fixtures.borderShadowPatterns);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis.borderShadow, 'borderColors', 'Should have borderColors');
    assert.truthy(analysis.borderShadow.borderColors.length > 0, 'Should find border colors');

    clearFixture();
  });

  test('identifies common radius values (pill, rounded, square)', async () => {
    setFixture(Fixtures.borderShadowPatterns);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis.borderShadow, 'radiusCategories', 'Should categorize radii');
    assert.truthy(
      analysis.borderShadow.radiusCategories.pill !== undefined ||
      analysis.borderShadow.radiusCategories.rounded !== undefined,
      'Should identify radius categories'
    );

    clearFixture();
  });

  test('identifies shadow intensity levels', async () => {
    setFixture(Fixtures.borderShadowPatterns);

    const analysis = await Analyzer.analyze();

    assert.hasProperty(analysis.borderShadow, 'shadowLevels', 'Should categorize shadows');

    clearFixture();
  });
});

// ===========================================
// Run all tests
// ===========================================

TestRunner.run();
