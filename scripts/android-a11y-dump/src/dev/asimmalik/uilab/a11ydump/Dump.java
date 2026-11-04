package dev.asimmalik.uilab.a11ydump;

import android.accessibilityservice.AccessibilityServiceInfo;
import android.app.Activity;
import android.app.Instrumentation;
import android.app.UiAutomation;
import android.graphics.Rect;
import android.os.Bundle;
import android.os.SystemClock;
import android.util.Base64;
import android.view.accessibility.AccessibilityNodeInfo;
import android.view.accessibility.AccessibilityWindowInfo;

import org.json.JSONArray;
import org.json.JSONObject;

import java.nio.charset.StandardCharsets;
import java.util.List;

public class Dump extends Instrumentation {
    private float density;
    private String focusId;

    private static AccessibilityNodeInfo find(AccessibilityNodeInfo n, String id) {
        // "text:<s>" matches a node's text or content description instead of its testID.
        // "px:<l,t,r,b>" matches a focusable node's bounds in pixels.
        CharSequence label = n.getContentDescription() != null ? n.getContentDescription() : n.getText();
        Rect r = new Rect();
        n.getBoundsInScreen(r);
        if (id.startsWith("text:") ? label != null && id.substring(5).contentEquals(label)
                : id.startsWith("px:") ? n.isFocusable() && id.substring(3).equals(r.left + "," + r.top + "," + r.right + "," + r.bottom)
                : id.equals(n.getViewIdResourceName())) return n;
        for (int i = 0; i < n.getChildCount(); i++) {
            AccessibilityNodeInfo c = n.getChild(i);
            AccessibilityNodeInfo hit = c == null ? null : find(c, id);
            if (hit != null) return hit;
        }
        return null;
    }

    @Override
    public void onCreate(Bundle arguments) {
        super.onCreate(arguments);
        focusId = arguments == null ? null : arguments.getString("focus");
        start();
    }

    @Override
    public void onStart() {
        Bundle out = new Bundle();
        try {
            density = getContext().getResources().getDisplayMetrics().density;
            UiAutomation ua = getUiAutomation(UiAutomation.FLAG_DONT_SUPPRESS_ACCESSIBILITY_SERVICES);
            AccessibilityServiceInfo info = ua.getServiceInfo();
            info.flags |= AccessibilityServiceInfo.FLAG_REPORT_VIEW_IDS | AccessibilityServiceInfo.FLAG_RETRIEVE_INTERACTIVE_WINDOWS;
            info.flags &= ~AccessibilityServiceInfo.FLAG_INCLUDE_NOT_IMPORTANT_VIEWS;
            ua.setServiceInfo(info);
            SystemClock.sleep(300);

            JSONObject result = new JSONObject();
            Rect screen = new Rect();
            JSONArray windows = new JSONArray();
            List<AccessibilityWindowInfo> list = ua.getWindows();
            for (AccessibilityWindowInfo w : list) {
                JSONObject jw = new JSONObject();
                jw.put("type", w.getType());
                jw.put("active", w.isActive());
                jw.put("focused", w.isFocused());
                jw.put("layer", w.getLayer());
                CharSequence title = w.getTitle();
                jw.put("title", title == null ? null : title.toString());
                Rect b = new Rect();
                w.getBoundsInScreen(b);
                jw.put("bounds", rect(b));
                if (w.getType() == AccessibilityWindowInfo.TYPE_APPLICATION) screen.union(b);
                windows.put(jw);
            }
            AccessibilityNodeInfo root = ua.getRootInActiveWindow();
            // -e focus <testID>: move the screen reader's focus there, so TalkBack speaks it.
            if (root != null && focusId != null) {
                AccessibilityNodeInfo target = find(root, focusId);
                result.put("focused", target != null && target.performAction(AccessibilityNodeInfo.ACTION_ACCESSIBILITY_FOCUS));
            }
            JSONArray nodes = new JSONArray();
            if (root != null) walk(root, nodes, 0);
            result.put("density", density);
            result.put("screen", rect(screen));
            result.put("windows", windows);
            result.put("activePackage", root == null || root.getPackageName() == null ? null : root.getPackageName().toString());
            result.put("nodes", nodes);
            out.putString("json", Base64.encodeToString(result.toString().getBytes(StandardCharsets.UTF_8), Base64.NO_WRAP));
            finish(Activity.RESULT_OK, out);
        } catch (Throwable t) {
            out.putString("error", t.toString());
            finish(Activity.RESULT_CANCELED, out);
        }
    }

    private JSONObject rect(Rect r) throws Exception {
        JSONObject o = new JSONObject();
        o.put("x", r.left / density);
        o.put("y", r.top / density);
        o.put("w", r.width() / density);
        o.put("h", r.height() / density);
        o.put("px", r.left + "," + r.top + "," + r.right + "," + r.bottom);
        return o;
    }

    private static String str(CharSequence c) {
        return c == null ? null : c.toString();
    }

    private void walk(AccessibilityNodeInfo n, JSONArray out, int depth) throws Exception {
        JSONObject o = new JSONObject();
        o.put("depth", depth);
        o.put("className", str(n.getClassName()));
        o.put("id", n.getViewIdResourceName());
        o.put("text", str(n.getText()));
        o.put("contentDescription", str(n.getContentDescription()));
        // TalkBack names a control after the node it is labelled by (aria-labelledby in React Native).
        AccessibilityNodeInfo lb = n.getLabeledBy();
        o.put("labeledBy", lb == null ? null : str(lb.getText() != null ? lb.getText() : lb.getContentDescription()));
        o.put("hint", str(n.getHintText()));
        o.put("stateDescription", str(n.getStateDescription()));
        o.put("error", str(n.getError()));
        o.put("paneTitle", str(n.getPaneTitle()));
        o.put("tooltip", str(n.getTooltipText()));
        Bundle extras = n.getExtras();
        o.put("roleDescription", extras == null ? null : str(extras.getCharSequence("AccessibilityNodeInfo.roleDescription")));
        o.put("heading", n.isHeading());
        o.put("checkable", n.isCheckable());
        o.put("checked", n.isChecked());
        o.put("selected", n.isSelected());
        o.put("enabled", n.isEnabled());
        o.put("clickable", n.isClickable());
        o.put("focusable", n.isFocusable());
        o.put("visible", n.isVisibleToUser());
        o.put("screenReaderFocusable", n.isScreenReaderFocusable());
        o.put("editable", n.isEditable());
        AccessibilityNodeInfo.RangeInfo range = n.getRangeInfo();
        if (range != null) {
            JSONObject r = new JSONObject();
            r.put("type", range.getType());
            r.put("min", range.getMin());
            r.put("max", range.getMax());
            r.put("current", range.getCurrent());
            o.put("range", r);
        }
        JSONArray actions = new JSONArray();
        for (AccessibilityNodeInfo.AccessibilityAction a : n.getActionList()) {
            actions.put(a.getLabel() != null ? str(a.getLabel()) : actionName(a.getId()));
        }
        o.put("actions", actions);
        Rect b = new Rect();
        n.getBoundsInScreen(b);
        o.put("bounds", rect(b));
        out.put(o);
        for (int i = 0; i < n.getChildCount(); i++) {
            AccessibilityNodeInfo c = n.getChild(i);
            if (c != null) walk(c, out, depth + 1);
        }
    }

    private static String actionName(int id) {
        if (id == AccessibilityNodeInfo.ACTION_CLICK) return "click";
        if (id == AccessibilityNodeInfo.ACTION_LONG_CLICK) return "longClick";
        if (id == AccessibilityNodeInfo.ACTION_EXPAND) return "expand";
        if (id == AccessibilityNodeInfo.ACTION_COLLAPSE) return "collapse";
        if (id == AccessibilityNodeInfo.ACTION_SCROLL_FORWARD) return "scrollForward";
        if (id == AccessibilityNodeInfo.ACTION_SCROLL_BACKWARD) return "scrollBackward";
        if (id == AccessibilityNodeInfo.ACTION_SET_TEXT) return "setText";
        if (id == AccessibilityNodeInfo.ACTION_FOCUS) return "focus";
        if (id == AccessibilityNodeInfo.ACTION_ACCESSIBILITY_FOCUS) return "a11yFocus";
        if (id == android.R.id.accessibilityActionSetProgress) return "setProgress";
        if (id == android.R.id.accessibilityActionShowOnScreen) return "showOnScreen";
        return "action:" + id;
    }
}
