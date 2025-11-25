import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';

export function getSitemap(): any {
  const sitemapPath = path.join(__dirname, '../../../.sitemap.yaml');
  try {
    const file = fs.readFileSync(sitemapPath, 'utf8');
    return yaml.load(file);
  } catch (err: any) {
    console.error('Error loading sitemap:', err);
    return [];
  }
}

function _processItem(item: any, currentPath: string, children: any[]): { html: string, active: boolean } {
  let html = '';
  let isActive = false;
  const sidebarLink = Handlebars.partials['sidebar/link'] || '';
  const sidebarGroup = Handlebars.partials['sidebar/group'] || '';
  const sidebarSeparator = Handlebars.partials['sidebar/separator'] || '';
  const sidebarSettings = Handlebars.partials['sidebar/settings'] || '';
  const sidebarGuildLink = Handlebars.partials['sidebar/guild_link'] || '';
  if (typeof sidebarLink !== 'string' || typeof sidebarGroup !== 'string') {
    console.error('Sidebar link or group partials are not defined correctly.');
    return { html, active: false };
  }

  if (item.type === 'link') {
    isActive = item.href === currentPath;
    const template = Handlebars.compile(sidebarLink);
    html += template({
      ...item,
      active: isActive
    });
  } else if (item.type === 'guild_link') {
    isActive = item.href === currentPath;
    const template = Handlebars.compile(sidebarGuildLink);
    html += template({
      ...item,
      active: isActive
    });
  } else if (item.type === 'external') {
    const template = Handlebars.compile(sidebarLink);
    html += template({
      ...item,
      external: true,
      active: false
    });
  } else if (item.type === 'settings') {
    const template = Handlebars.compile(sidebarSettings);

    let childrenHtml = '';
    for (const child of children) {
      const result = _processItem(child, currentPath, child.children || []);
      childrenHtml += result.html;
      if (result.active) isActive = true;
    }
    html += template({
      ...item,
      children: childrenHtml,
      active: isActive
    });
  } else if (item.type === 'separator') {
    const template = Handlebars.compile(sidebarSeparator);
    html += template(item);
  } else if (item.type === 'group') {
    let childrenHtml = '';
    // Use children argument instead of item.children to support dynamic children and consistency
    const itemsToProcess = (children && children.length > 0) ? children : (item.children || []);
    for (const child of itemsToProcess) {
      const result = _processItem(child, currentPath, child.children || []);
      childrenHtml += result.html;
      if (result.active) isActive = true;
    }
    const groupTemplate = Handlebars.compile(sidebarGroup);
    html += groupTemplate({
      ...item,
      children: childrenHtml,
      active: isActive
    });
  }

  return { html, active: isActive };
}

function _titleCase(this: any, str: string): string {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
  }).replace(/_/g, ' ');
}

export function renderSidebar(this: any, sitemap: any[], currentPath: string, settingsGroups?: any[]) {

  let html = '';
  // Optionally inject settingsGroups into the sitemap or nav rendering logic
  // Example: If you want to add settings groups as nav items, you can do so here
  for (const item of sitemap) {
    // If item.type === 'settingsGroups', render each group as a link
    if (item.type === 'settings' && Array.isArray(settingsGroups)) {
      let children = []
      for (const group of settingsGroups) {
        const guildChildren: any[] = [];
        for (const guild_id of (group.guilds || [])) {
          guildChildren.push({
            id: `settings_${group.name}_${guild_id.guild_id}`,
            type: 'guild_link',
            title: guild_id.guild_id,
            href: `/settings/edit/${guild_id.guild_id}/${group.name}`,
          });
        }
        if (guildChildren.length === 0) continue;
        children.push({
          id: `settings_${group.name}`,
          type: 'group',
          title: group.displayName || _titleCase(group.name),
          icon: 'cog',
          children: guildChildren
        });
      }
      html += _processItem(item, currentPath, children).html;
    } else {
      html += _processItem(item, currentPath, item.children || []).html;
    }
  }
  return html;
}
