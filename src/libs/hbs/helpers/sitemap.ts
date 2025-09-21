import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';
import SettingsMongoClient from '../../mongo/Settings';

export function getSitemap() {
  const sitemapPath = path.join(__dirname, '../../../.sitemap.yaml');
  try {
    const file = fs.readFileSync(sitemapPath, 'utf8');
    return yaml.load(file);
  } catch (err: any) {
    console.error('Error loading sitemap:', err);
    return [];
  }
}

function processItem(item: any, currentPath: string, children: any[]): string {
  let html = '';
  const sidebarLink = Handlebars.partials['sidebar-link'] || '';
  const sidebarGroup = Handlebars.partials['sidebar-group'] || '';
  const sidebarSeparator = Handlebars.partials['sidebar-separator'] || '';
  const sidebarSettings = Handlebars.partials['sidebar-settings'] || '';
  if (typeof sidebarLink !== 'string' || typeof sidebarGroup !== 'string') {
    console.error('Sidebar link or group partials are not defined correctly.');
    return html;
  }

  if (item.type === 'link') {
    console.log('Processing link item:', JSON.stringify(item));
    const template = Handlebars.compile(sidebarLink);
    html += template({
      ...item,
      active: item.href === currentPath
    });
  } else if (item.type === 'external') {
    console.log('Processing external link item:', JSON.stringify(item));
    const template = Handlebars.compile(sidebarLink);
    html += template({
      ...item,
      external: true,
      active: false
    });
  } else if (item.type === 'settings') {
    console.log('Processing settings item:', JSON.stringify(item));
    const template = Handlebars.compile(sidebarSettings);

    let childrenHtml = '';
    for (const child of children) {
      childrenHtml += processItem(child, currentPath, child.children || []);
    }
    html += template({
      ...item,
      children: childrenHtml
    });
  } else if (item.type === 'separator') {
    console.log('Processing separator item:', JSON.stringify(item));
    const template = Handlebars.compile(sidebarSeparator);
    html += template(item);
  } else if (item.type === 'group') {
    console.log('Processing group item:', JSON.stringify(item));
    let childrenHtml = '';
    for (const child of item.children) {
      childrenHtml += processItem(child, currentPath, child.children || []); // Pass empty array if no children
    }
    const groupTemplate = Handlebars.compile(sidebarGroup);
    html += groupTemplate({
      ...item,
      children: childrenHtml
    });
  }

  return html;
}

function titleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
  }).replace(/_/g, ' ');
}

export function renderSidebar(sitemap: any[], currentPath: string, settingsGroups?: any[]) {

  let html = '';
  // Optionally inject settingsGroups into the sitemap or nav rendering logic
  // Example: If you want to add settings groups as nav items, you can do so here
  for (const item of sitemap) {
    // If item.type === 'settingsGroups', render each group as a link
    if (item.type === 'settings' && Array.isArray(settingsGroups)) {
      console.log('Rendering settings groups:', settingsGroups);
      let children = []
      for (const group of settingsGroups) {
        children.push({
          type: 'link',
          title: titleCase(group),
          href:`/settings/edit/${group}`,
          icon: 'cog',
        });
      }
      html += processItem(item, currentPath, children);
    } else {
      html += processItem(item, currentPath, item.children || []);
    }
  }
  return html;
}
