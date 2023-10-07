import "./templates/d-alert.std";
import "./templates/d-card.std";
import "./templates/d-carousel.std";
import "./templates/d-listgroup.std";
import "./templates/d-loading.std";
import "./templates/d-panel.std";
import "./templates/d-progress.std";

import "./templates/f-button.std";
import "./templates/f-code.std";
import "./templates/f-date.std";
import "./templates/f-file.std";
import "./templates/f-form.std";
import "./templates/f-image.std";
import "./templates/f-input.std";
import "./templates/f-multiselect.std";
import "./templates/f-richtext.std";
import "./templates/f-select.std";
import "./templates/f-singleselect.std";
import "./templates/f-textarea.std";
import "./templates/f-time.std";
import "./templates/f-toggle.std";

import "./templates/l-accordion.std";
import "./templates/l-col.std";
import "./templates/l-container.std";
import "./templates/l-header.std";
import "./templates/l-row.std";
import "./templates/l-table-cell.std";
import "./templates/l-table-row.std";
import "./templates/l-table.std";
import "./templates/l-templated.std";

import "./templates/o-dropdown.std";
import "./templates/o-modal.std";
import "./templates/o-offcanvas.std";
import "./templates/o-toast.std";

import "./templates/t-badge.std";
import "./templates/t-code.std";
import "./templates/t-crumbs.std";
import "./templates/t-heading.std";
import "./templates/t-icon.std";
import "./templates/t-link.std";
import "./templates/t-localised.std";
import "./templates/t-paragraph.std";
import "./templates/t-richtext.std";

import "./templates/u-each.std";
import "./templates/u-fetch.std";
import "./templates/u-global.std";
import "./templates/u-if.std";
import "./templates/u-paginator.std";
import "./templates/u-route.std";
import "./templates/u-text.std";
import "./templates/u-use.std";

// @ts-ignore
import GlobalCss from "./global.pss";
// @ts-ignore
import RenderSheet from "@ipheion/wholemeal/css";

const style = document.createElement("style");
style.innerHTML = RenderSheet(GlobalCss());
document.head.append(style);
