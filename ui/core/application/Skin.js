export class Section {
    name: string;
    elements: Element[] = [];
    sections: Section[] = [];
    parent: ?Section = null;

    constructor(name: string) {
        this.name = name;
    }

    element(name: string, cssField: string, value: string): Section {
        const element = new Element(this, name, cssField, value);
        this.elements.push(element);
        return this;
    }

    section(name: string) {
        const section = new Section(name);
        section.parent = this;
        this.sections.push(section);
        return section;
    }

}

export class Element {
    name: string;
    cssField: string;
    value: string;
    parent: Section;

    constructor(parent: Section, name: string, cssField: string, value: string) {
        this.parent = parent;
        this.name = name;
        this.cssField = cssField;
        this.value = value;
    }
}

export const MAIN = new Section("Główna");
export const EDIT = MAIN.section("Pole edycyjne");
export const BUTTON = MAIN.section("Przycisk");
export const TABLE = MAIN.section("Tabelka");

export const EDIT_FOREGROUND = EDIT.element("Kolor tekstu", "color", "#333");
export const EDIT_BACKGROUND = EDIT.element("Kolor tła", "backgroundColor", "#fafafa");

export const BUTTON_FOREGROUND = BUTTON.element("Kolor tekstu", "color", "#333");
export const BUTTON_BACKGROUND = BUTTON.element("Kolor tła", "backgroundColor", "#fafafa");

export const TABLE_FOREGROUND = BUTTON.element("Kolor tekstu", "color", "#333");
export const TABLE_BACKGROUND = BUTTON.element("Kolor tła", "backgroundColor", "#fafafa");