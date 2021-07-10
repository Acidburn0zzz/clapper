const { Adw, GObject, Gio, Gst, Gtk } = imports.gi;
const Misc = imports.src.misc;

const { settings } = Misc;

/* PlayFlags are not exported through GI */
Gst.PlayFlags = {
    VIDEO: 1,
    AUDIO: 2,
    TEXT: 4,
    VIS: 8,
    SOFT_VOLUME: 16,
    NATIVE_AUDIO: 32,
    NATIVE_VIDEO: 64,
    DOWNLOAD: 128,
    BUFFERING: 256,
    DEINTERLACE: 512,
    SOFT_COLORBALANCE: 1024,
    FORCE_FILTERS: 2048,
    FORCE_SW_DECODERS: 4096,
};

const widgetOpts = {
    halign: Gtk.Align.CENTER,
    valign: Gtk.Align.CENTER,
};

function getCommonProps()
{
    return {
        'schema-name': GObject.ParamSpec.string(
            'schema-name',
            'GSchema setting name',
            'Name of the setting to bind',
            GObject.ParamFlags.WRITABLE,
            null
        ),
    };
}

const flags = Gio.SettingsBindFlags.DEFAULT;

let PrefsActionRow = GObject.registerClass({
    GTypeName: 'ClapperPrefsActionRow',
    Properties: getCommonProps(),
},
class ClapperPrefsActionRow extends Adw.ActionRow
{
    _init(widget)
    {
        super._init();

        this._schemaName = null;
        this._bindProp = null;

        this.add_suffix(widget);
        this.set_activatable_widget(widget);
    }

    set schema_name(value)
    {
        this._schemaName = value;
    }

    vfunc_realize()
    {
        super.vfunc_realize();

        if(this._schemaName && this._bindProp) {
            settings.bind(this._schemaName,
                this.activatable_widget, this._bindProp, flags
            );
        }
        this._schemaName = null;
    }
});

GObject.registerClass({
    GTypeName: 'ClapperPrefsSwitch',
},
class ClapperPrefsSwitch extends PrefsActionRow
{
    _init()
    {
        super._init(new Gtk.Switch(widgetOpts));
        this._bindProp = 'active';
    }
});

GObject.registerClass({
    GTypeName: 'ClapperPrefsSpin',
    Properties: {
        'spin-adjustment': GObject.ParamSpec.object(
            'spin-adjustment',
            'GtkAdjustment',
            'Custom GtkAdjustment for spin button',
            GObject.ParamFlags.WRITABLE,
            Gtk.Adjustment
        ),
    },
},
class ClapperPrefsSpin extends PrefsActionRow
{
    _init()
    {
        super._init(new Gtk.SpinButton(widgetOpts));
        this._bindProp = 'value';
    }

    set spin_adjustment(value)
    {
        this.activatable_widget.set_adjustment(value);
    }
});

GObject.registerClass({
    GTypeName: 'ClapperPrefsFont',
},
class ClapperPrefsFont extends PrefsActionRow
{
    _init()
    {
        const opts = {
            use_font: true,
            use_size: true,
        };
        Object.assign(opts, widgetOpts);

        super._init(new Gtk.FontButton(opts));
        this._bindProp = 'font';
    }
});

GObject.registerClass({
    GTypeName: 'ClapperPrefsCombo',
    Properties: getCommonProps(),
},
class ClapperPrefsCombo extends Adw.ComboRow
{
    _init()
    {
        super._init();
        this._schemaName = null;
    }

    set schema_name(value)
    {
        this._schemaName = value;
    }

    vfunc_realize()
    {
        super.vfunc_realize();

        if(this._schemaName)
            settings.bind(this._schemaName, this, 'selected', flags);

        this._schemaName = null;
    }
});

GObject.registerClass({
    GTypeName: 'ClapperPrefsExpander',
    Properties: getCommonProps(),
},
class ClapperPrefsExpander extends Adw.ExpanderRow
{
    _init()
    {
        super._init({
            show_enable_switch: true,
        });
    }

    set schema_name(value)
    {
        settings.bind(value, this, 'enable-expansion', flags);
    }
});

var PrefsWindow = GObject.registerClass({
    GTypeName: 'ClapperPrefsWindow',
    Template: `file://${Misc.getClapperPath()}/ui/preferences-window.ui`,
},
class ClapperPrefsWindow extends Adw.PreferencesWindow
{
    _init(window)
    {
        super._init({
            transient_for: window,
        });

        this.show();
    }
});
