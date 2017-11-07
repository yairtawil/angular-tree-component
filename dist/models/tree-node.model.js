var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { observable, computed, action } from 'mobx';
import { TREE_EVENTS } from '../constants/events';
import * as _ from 'lodash';
var first = _.first, last = _.last;
var TreeNode = /** @class */ (function () {
    function TreeNode(data, parent, treeModel, index) {
        var _this = this;
        this.data = data;
        this.parent = parent;
        this.treeModel = treeModel;
        this.position = 0;
        this.allowDrop = function (element, $event) {
            return _this.options.allowDrop(element, { parent: _this, index: 0 }, $event);
        };
        if (this.id === undefined || this.id === null) {
            this.id = uuid();
        } // Make sure there's a unique id without overriding existing ids to work with immutable data structures
        this.index = index;
        if (this.getField('children')) {
            this._initChildren();
        }
    }
    Object.defineProperty(TreeNode.prototype, "isHidden", {
        get: function () { return this.treeModel.isHidden(this); },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(TreeNode.prototype, "isExpanded", {
        get: function () { return this.treeModel.isExpanded(this); },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(TreeNode.prototype, "isActive", {
        get: function () { return this.treeModel.isActive(this); },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(TreeNode.prototype, "isFocused", {
        get: function () { return this.treeModel.isNodeFocused(this); },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(TreeNode.prototype, "level", {
        get: function () {
            return this.parent ? this.parent.level + 1 : 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TreeNode.prototype, "path", {
        get: function () {
            return this.parent ? this.parent.path.concat([this.id]) : [];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TreeNode.prototype, "elementRef", {
        get: function () {
            throw "Element Ref is no longer supported since introducing virtual scroll\n\n      You may use a template to obtain a reference to the element";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TreeNode.prototype, "originalNode", {
        get: function () { return this._originalNode; },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(TreeNode.prototype, "hasChildren", {
        // helper get functions:
        get: function () {
            return !!(this.data.hasChildren || (this.children && this.children.length > 0));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TreeNode.prototype, "isCollapsed", {
        get: function () { return !this.isExpanded; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TreeNode.prototype, "isLeaf", {
        get: function () { return !this.hasChildren; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TreeNode.prototype, "isRoot", {
        get: function () { return this.parent.data.virtual; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TreeNode.prototype, "realParent", {
        get: function () { return this.isRoot ? null : this.parent; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TreeNode.prototype, "options", {
        // proxy functions:
        get: function () { return this.treeModel.options; },
        enumerable: true,
        configurable: true
    });
    TreeNode.prototype.fireEvent = function (event) { this.treeModel.fireEvent(event); };
    Object.defineProperty(TreeNode.prototype, "displayField", {
        // field accessors:
        get: function () {
            return this.getField('display');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TreeNode.prototype, "id", {
        get: function () {
            return this.getField('id');
        },
        set: function (value) {
            this.setField('id', value);
        },
        enumerable: true,
        configurable: true
    });
    TreeNode.prototype.getField = function (key) {
        return this.data[this.options[key + "Field"]];
    };
    TreeNode.prototype.setField = function (key, value) {
        this.data[this.options[key + "Field"]] = value;
    };
    // traversing:
    TreeNode.prototype._findAdjacentSibling = function (steps, skipHidden) {
        if (skipHidden === void 0) { skipHidden = false; }
        return this._getParentsChildren(skipHidden)[this.index + steps];
    };
    TreeNode.prototype.findNextSibling = function (skipHidden) {
        if (skipHidden === void 0) { skipHidden = false; }
        return this._findAdjacentSibling(+1, skipHidden);
    };
    TreeNode.prototype.findPreviousSibling = function (skipHidden) {
        if (skipHidden === void 0) { skipHidden = false; }
        return this._findAdjacentSibling(-1, skipHidden);
    };
    TreeNode.prototype.getVisibleChildren = function () {
        return this.visibleChildren;
    };
    Object.defineProperty(TreeNode.prototype, "visibleChildren", {
        get: function () {
            return (this.children || []).filter(function (node) { return !node.isHidden; });
        },
        enumerable: true,
        configurable: true
    });
    TreeNode.prototype.getFirstChild = function (skipHidden) {
        if (skipHidden === void 0) { skipHidden = false; }
        var children = skipHidden ? this.visibleChildren : this.children;
        return first(children || []);
    };
    TreeNode.prototype.getLastChild = function (skipHidden) {
        if (skipHidden === void 0) { skipHidden = false; }
        var children = skipHidden ? this.visibleChildren : this.children;
        return last(children || []);
    };
    TreeNode.prototype.findNextNode = function (goInside, skipHidden) {
        if (goInside === void 0) { goInside = true; }
        if (skipHidden === void 0) { skipHidden = false; }
        return goInside && this.isExpanded && this.getFirstChild(skipHidden) ||
            this.findNextSibling(skipHidden) ||
            this.parent && this.parent.findNextNode(false, skipHidden);
    };
    TreeNode.prototype.findPreviousNode = function (skipHidden) {
        if (skipHidden === void 0) { skipHidden = false; }
        var previousSibling = this.findPreviousSibling(skipHidden);
        if (!previousSibling) {
            return this.realParent;
        }
        return previousSibling._getLastOpenDescendant(skipHidden);
    };
    TreeNode.prototype._getLastOpenDescendant = function (skipHidden) {
        if (skipHidden === void 0) { skipHidden = false; }
        var lastChild = this.getLastChild(skipHidden);
        return (this.isCollapsed || !lastChild)
            ? this
            : lastChild._getLastOpenDescendant(skipHidden);
    };
    TreeNode.prototype._getParentsChildren = function (skipHidden) {
        if (skipHidden === void 0) { skipHidden = false; }
        var children = this.parent &&
            (skipHidden ? this.parent.getVisibleChildren() : this.parent.children);
        return children || [];
    };
    TreeNode.prototype.getIndexInParent = function (skipHidden) {
        if (skipHidden === void 0) { skipHidden = false; }
        return this._getParentsChildren(skipHidden).indexOf(this);
    };
    TreeNode.prototype.isDescendantOf = function (node) {
        if (this === node)
            return true;
        else
            return this.parent && this.parent.isDescendantOf(node);
    };
    TreeNode.prototype.getNodePadding = function () {
        return this.options.levelPadding * (this.level - 1) + 'px';
    };
    TreeNode.prototype.getClass = function () {
        return [this.options.nodeClass(this), "tree-node-level-" + this.level].join(' ');
    };
    TreeNode.prototype.onDrop = function ($event) {
        this.mouseAction('drop', $event.event, {
            from: $event.element,
            to: { parent: this, index: 0, dropOnNode: true }
        });
    };
    TreeNode.prototype.allowDrag = function () {
        return this.options.allowDrag(this);
    };
    // helper methods:
    TreeNode.prototype.loadNodeChildren = function () {
        var _this = this;
        if (!this.options.getChildren) {
            return Promise.resolve(); // Not getChildren method - for using redux
        }
        return Promise.resolve(this.options.getChildren(this))
            .then(function (children) {
            if (children) {
                _this.setField('children', children);
                _this._initChildren();
                _this.children.forEach(function (child) {
                    if (child.getField('isExpanded') && child.hasChildren) {
                        child.expand();
                    }
                });
            }
        }).then(function () {
            _this.fireEvent({
                eventName: TREE_EVENTS.loadNodeChildren,
                node: _this
            });
        });
    };
    TreeNode.prototype.expand = function () {
        if (!this.isExpanded) {
            return this.toggleExpanded();
        }
        return Promise.resolve();
    };
    TreeNode.prototype.collapse = function () {
        if (this.isExpanded) {
            this.toggleExpanded();
        }
        return this;
    };
    TreeNode.prototype.doForAll = function (fn) {
        var _this = this;
        Promise.resolve(fn(this)).then(function () {
            if (_this.children) {
                _this.children.forEach(function (child) { return child.doForAll(fn); });
            }
        });
    };
    TreeNode.prototype.expandAll = function () {
        this.doForAll(function (node) { return node.expand(); });
    };
    TreeNode.prototype.collapseAll = function () {
        this.doForAll(function (node) { return node.collapse(); });
    };
    TreeNode.prototype.ensureVisible = function () {
        if (this.realParent) {
            this.realParent.expand();
            this.realParent.ensureVisible();
        }
        return this;
    };
    TreeNode.prototype.toggleExpanded = function () {
        return this.setIsExpanded(!this.isExpanded);
    };
    TreeNode.prototype.setIsExpanded = function (value) {
        if (this.hasChildren) {
            this.treeModel.setExpandedNode(this, value);
            if (!this.children && this.hasChildren && value) {
                return this.loadNodeChildren();
            }
        }
        return Promise.resolve();
    };
    ;
    TreeNode.prototype.setIsActive = function (value, multi) {
        if (multi === void 0) { multi = false; }
        this.treeModel.setActiveNode(this, value, multi);
        if (value) {
            this.focus(this.options.scrollOnSelect);
        }
        return this;
    };
    TreeNode.prototype.toggleActivated = function (multi) {
        if (multi === void 0) { multi = false; }
        this.setIsActive(!this.isActive, multi);
        return this;
    };
    TreeNode.prototype.setActiveAndVisible = function (multi) {
        if (multi === void 0) { multi = false; }
        this.setIsActive(true, multi)
            .ensureVisible();
        setTimeout(this.scrollIntoView.bind(this));
        return this;
    };
    TreeNode.prototype.scrollIntoView = function (force) {
        if (force === void 0) { force = false; }
        this.treeModel.virtualScroll.scrollIntoView(this, force);
    };
    TreeNode.prototype.focus = function (scroll) {
        if (scroll === void 0) { scroll = true; }
        var previousNode = this.treeModel.getFocusedNode();
        this.treeModel.setFocusedNode(this);
        if (scroll) {
            this.scrollIntoView();
        }
        if (previousNode) {
            this.fireEvent({ eventName: TREE_EVENTS.blur, node: previousNode });
        }
        this.fireEvent({ eventName: TREE_EVENTS.focus, node: this });
        return this;
    };
    TreeNode.prototype.blur = function () {
        var previousNode = this.treeModel.getFocusedNode();
        this.treeModel.setFocusedNode(null);
        if (previousNode) {
            this.fireEvent({ eventName: TREE_EVENTS.blur, node: this });
        }
        return this;
    };
    TreeNode.prototype.setIsHidden = function (value) {
        this.treeModel.setIsHidden(this, value);
    };
    TreeNode.prototype.hide = function () {
        this.setIsHidden(true);
    };
    TreeNode.prototype.show = function () {
        this.setIsHidden(false);
    };
    TreeNode.prototype.mouseAction = function (actionName, $event, data) {
        if (data === void 0) { data = null; }
        this.treeModel.setFocus(true);
        var actionMapping = this.options.actionMapping.mouse;
        var action = actionMapping[actionName];
        if (action) {
            action(this.treeModel, this, $event, data);
        }
    };
    TreeNode.prototype.getSelfHeight = function () {
        return this.options.nodeHeight(this);
    };
    TreeNode.prototype._initChildren = function () {
        var _this = this;
        this.children = this.getField('children')
            .map(function (c, index) { return new TreeNode(c, _this, _this.treeModel, index); });
    };
    __decorate([
        computed,
        __metadata("design:type", Object),
        __metadata("design:paramtypes", [])
    ], TreeNode.prototype, "isHidden", null);
    __decorate([
        computed,
        __metadata("design:type", Object),
        __metadata("design:paramtypes", [])
    ], TreeNode.prototype, "isExpanded", null);
    __decorate([
        computed,
        __metadata("design:type", Object),
        __metadata("design:paramtypes", [])
    ], TreeNode.prototype, "isActive", null);
    __decorate([
        computed,
        __metadata("design:type", Object),
        __metadata("design:paramtypes", [])
    ], TreeNode.prototype, "isFocused", null);
    __decorate([
        observable,
        __metadata("design:type", Array)
    ], TreeNode.prototype, "children", void 0);
    __decorate([
        observable,
        __metadata("design:type", Number)
    ], TreeNode.prototype, "index", void 0);
    __decorate([
        observable,
        __metadata("design:type", Object)
    ], TreeNode.prototype, "position", void 0);
    __decorate([
        observable,
        __metadata("design:type", Number)
    ], TreeNode.prototype, "height", void 0);
    __decorate([
        computed,
        __metadata("design:type", Number),
        __metadata("design:paramtypes", [])
    ], TreeNode.prototype, "level", null);
    __decorate([
        computed,
        __metadata("design:type", Array),
        __metadata("design:paramtypes", [])
    ], TreeNode.prototype, "path", null);
    __decorate([
        computed,
        __metadata("design:type", Object),
        __metadata("design:paramtypes", [])
    ], TreeNode.prototype, "visibleChildren", null);
    __decorate([
        action,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], TreeNode.prototype, "_initChildren", null);
    return TreeNode;
}());
export { TreeNode };
function uuid() {
    return Math.floor(Math.random() * 10000000000000);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9tb2RlbHMvdHJlZS1ub2RlLm1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFXLE1BQU0sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUk3RCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFFbEQsT0FBTyxLQUFLLENBQUMsTUFBTSxRQUFRLENBQUM7QUFDcEIsSUFBQSxlQUFLLEVBQUUsYUFBSSxDQUFPO0FBRTFCO0lBeUJFLGtCQUFtQixJQUFTLEVBQVMsTUFBZ0IsRUFBUyxTQUFvQixFQUFFLEtBQWE7UUFBakcsaUJBU0M7UUFUa0IsU0FBSSxHQUFKLElBQUksQ0FBSztRQUFTLFdBQU0sR0FBTixNQUFNLENBQVU7UUFBUyxjQUFTLEdBQVQsU0FBUyxDQUFXO1FBakJ0RSxhQUFRLEdBQUcsQ0FBQyxDQUFDO1FBbUp6QixjQUFTLEdBQUcsVUFBQyxPQUFPLEVBQUUsTUFBTztZQUMzQixNQUFNLENBQUMsS0FBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsTUFBTSxFQUFFLEtBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDN0UsQ0FBQyxDQUFBO1FBbklDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxFQUFFLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQztZQUM5QyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksRUFBRSxDQUFDO1FBQ25CLENBQUMsQ0FBQyx1R0FBdUc7UUFDekcsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFFbkIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDOUIsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FB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LENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxFQUE1QyxDQUE0QyxDQUFDLENBQUM7SUFDckUsQ0FBQztJQXJVUztRQUFULFFBQVE7Ozs0Q0FBeUQ7SUFDeEQ7UUFBVCxRQUFROzs7OENBQTZEO0lBQzVEO1FBQVQsUUFBUTs7OzRDQUF5RDtJQUN4RDtRQUFULFFBQVE7Ozs2Q0FBK0Q7SUFFNUQ7UUFBWCxVQUFVOzs4Q0FBc0I7SUFDckI7UUFBWCxVQUFVOzsyQ0FBZTtJQUNkO1FBQVgsVUFBVTs7OENBQWM7SUFDYjtRQUFYLFVBQVU7OzRDQUFnQjtJQUNqQjtRQUFULFFBQVE7Ozt5Q0FFUjtJQUNTO1FBQVQsUUFBUTs7O3dDQUVSO0lBd0VTO1FBQVQsUUFBUTs7O21EQUVSO0lBME9PO1FBQVAsTUFBTTs7OztpREFHTjtJQUNILGVBQUM7Q0F2VUQsQUF1VUMsSUFBQTtTQXZVWSxRQUFRO0FBeVVyQjtJQUNFLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxjQUFjLENBQUMsQ0FBQztBQUNwRCxDQUFDIiwiZmlsZSI6InRyZWUtbm9kZS5tb2RlbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBvYnNlcnZhYmxlLCBjb21wdXRlZCwgYXV0b3J1biwgYWN0aW9uIH0gZnJvbSAnbW9ieCc7XHJcbmltcG9ydCB7IFRyZWVNb2RlbCB9IGZyb20gJy4vdHJlZS5tb2RlbCc7XHJcbmltcG9ydCB7IFRyZWVPcHRpb25zIH0gZnJvbSAnLi90cmVlLW9wdGlvbnMubW9kZWwnO1xyXG5pbXBvcnQgeyBJVHJlZU5vZGUgfSBmcm9tICcuLi9kZWZzL2FwaSc7XHJcbmltcG9ydCB7IFRSRUVfRVZFTlRTIH0gZnJvbSAnLi4vY29uc3RhbnRzL2V2ZW50cyc7XHJcblxyXG5pbXBvcnQgKiBhcyBfIGZyb20gJ2xvZGFzaCc7XHJcbmNvbnN0IHsgZmlyc3QsIGxhc3QgfSA9IF87XHJcblxyXG5leHBvcnQgY2xhc3MgVHJlZU5vZGUgaW1wbGVtZW50cyBJVHJlZU5vZGUge1xyXG4gIEBjb21wdXRlZCBnZXQgaXNIaWRkZW4oKSB7IHJldHVybiB0aGlzLnRyZWVNb2RlbC5pc0hpZGRlbih0aGlzKTsgfTtcclxuICBAY29tcHV0ZWQgZ2V0IGlzRXhwYW5kZWQoKSB7IHJldHVybiB0aGlzLnRyZWVNb2RlbC5pc0V4cGFuZGVkKHRoaXMpOyB9O1xyXG4gIEBjb21wdXRlZCBnZXQgaXNBY3RpdmUoKSB7IHJldHVybiB0aGlzLnRyZWVNb2RlbC5pc0FjdGl2ZSh0aGlzKTsgfTtcclxuICBAY29tcHV0ZWQgZ2V0IGlzRm9jdXNlZCgpIHsgcmV0dXJuIHRoaXMudHJlZU1vZGVsLmlzTm9kZUZvY3VzZWQodGhpcyk7IH07XHJcblxyXG4gIEBvYnNlcnZhYmxlIGNoaWxkcmVuOiBUcmVlTm9kZVtdO1xyXG4gIEBvYnNlcnZhYmxlIGluZGV4OiBudW1iZXI7XHJcbiAgQG9ic2VydmFibGUgcG9zaXRpb24gPSAwO1xyXG4gIEBvYnNlcnZhYmxlIGhlaWdodDogbnVtYmVyO1xyXG4gIEBjb21wdXRlZCBnZXQgbGV2ZWwoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLnBhcmVudCA/IHRoaXMucGFyZW50LmxldmVsICsgMSA6IDA7XHJcbiAgfVxyXG4gIEBjb21wdXRlZCBnZXQgcGF0aCgpOiBzdHJpbmdbXSB7XHJcbiAgICByZXR1cm4gdGhpcy5wYXJlbnQgPyBbLi4udGhpcy5wYXJlbnQucGF0aCwgdGhpcy5pZF0gOiBbXTtcclxuICB9XHJcblxyXG4gIGdldCBlbGVtZW50UmVmKCk6IGFueSB7XHJcbiAgICB0aHJvdyBgRWxlbWVudCBSZWYgaXMgbm8gbG9uZ2VyIHN1cHBvcnRlZCBzaW5jZSBpbnRyb2R1Y2luZyB2aXJ0dWFsIHNjcm9sbFxcblxyXG4gICAgICBZb3UgbWF5IHVzZSBhIHRlbXBsYXRlIHRvIG9idGFpbiBhIHJlZmVyZW5jZSB0byB0aGUgZWxlbWVudGA7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIF9vcmlnaW5hbE5vZGU6IGFueTtcclxuICBnZXQgb3JpZ2luYWxOb2RlKCkgeyByZXR1cm4gdGhpcy5fb3JpZ2luYWxOb2RlOyB9O1xyXG5cclxuICBjb25zdHJ1Y3RvcihwdWJsaWMgZGF0YTogYW55LCBwdWJsaWMgcGFyZW50OiBUcmVlTm9kZSwgcHVibGljIHRyZWVNb2RlbDogVHJlZU1vZGVsLCBpbmRleDogbnVtYmVyKSB7XHJcbiAgICBpZiAodGhpcy5pZCA9PT0gdW5kZWZpbmVkIHx8IHRoaXMuaWQgPT09IG51bGwpIHtcclxuICAgICAgdGhpcy5pZCA9IHV1aWQoKTtcclxuICAgIH0gLy8gTWFrZSBzdXJlIHRoZXJlJ3MgYSB1bmlxdWUgaWQgd2l0aG91dCBvdmVycmlkaW5nIGV4aXN0aW5nIGlkcyB0byB3b3JrIHdpdGggaW1tdXRhYmxlIGRhdGEgc3RydWN0dXJlc1xyXG4gICAgdGhpcy5pbmRleCA9IGluZGV4O1xyXG5cclxuICAgIGlmICh0aGlzLmdldEZpZWxkKCdjaGlsZHJlbicpKSB7XHJcbiAgICAgIHRoaXMuX2luaXRDaGlsZHJlbigpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gaGVscGVyIGdldCBmdW5jdGlvbnM6XHJcbiAgZ2V0IGhhc0NoaWxkcmVuKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuICEhKHRoaXMuZGF0YS5oYXNDaGlsZHJlbiB8fCAodGhpcy5jaGlsZHJlbiAmJiB0aGlzLmNoaWxkcmVuLmxlbmd0aCA+IDApKTtcclxuICB9XHJcbiAgZ2V0IGlzQ29sbGFwc2VkKCk6IGJvb2xlYW4geyByZXR1cm4gIXRoaXMuaXNFeHBhbmRlZDsgfVxyXG4gIGdldCBpc0xlYWYoKTogYm9vbGVhbiB7IHJldHVybiAhdGhpcy5oYXNDaGlsZHJlbjsgfVxyXG4gIGdldCBpc1Jvb3QoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLnBhcmVudC5kYXRhLnZpcnR1YWw7IH1cclxuICBnZXQgcmVhbFBhcmVudCgpOiBUcmVlTm9kZSB7IHJldHVybiB0aGlzLmlzUm9vdCA/IG51bGwgOiB0aGlzLnBhcmVudDsgfVxyXG5cclxuICAvLyBwcm94eSBmdW5jdGlvbnM6XHJcbiAgZ2V0IG9wdGlvbnMoKTogVHJlZU9wdGlvbnMgeyByZXR1cm4gdGhpcy50cmVlTW9kZWwub3B0aW9uczsgfVxyXG4gIGZpcmVFdmVudChldmVudCkgeyB0aGlzLnRyZWVNb2RlbC5maXJlRXZlbnQoZXZlbnQpOyB9XHJcblxyXG4gIC8vIGZpZWxkIGFjY2Vzc29yczpcclxuICBnZXQgZGlzcGxheUZpZWxkKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0RmllbGQoJ2Rpc3BsYXknKTtcclxuICB9XHJcblxyXG4gIGdldCBpZCgpIHtcclxuICAgIHJldHVybiB0aGlzLmdldEZpZWxkKCdpZCcpO1xyXG4gIH1cclxuXHJcbiAgc2V0IGlkKHZhbHVlKSB7XHJcbiAgICB0aGlzLnNldEZpZWxkKCdpZCcsIHZhbHVlKTtcclxuICB9XHJcblxyXG4gIGdldEZpZWxkKGtleSkge1xyXG4gICAgcmV0dXJuIHRoaXMuZGF0YVt0aGlzLm9wdGlvbnNbYCR7a2V5fUZpZWxkYF1dO1xyXG4gIH1cclxuXHJcbiAgc2V0RmllbGQoa2V5LCB2YWx1ZSkge1xyXG4gICAgdGhpcy5kYXRhW3RoaXMub3B0aW9uc1tgJHtrZXl9RmllbGRgXV0gPSB2YWx1ZTtcclxuICB9XHJcblxyXG4gIC8vIHRyYXZlcnNpbmc6XHJcbiAgX2ZpbmRBZGphY2VudFNpYmxpbmcoc3RlcHMsIHNraXBIaWRkZW4gPSBmYWxzZSkge1xyXG4gICAgcmV0dXJuIHRoaXMuX2dldFBhcmVudHNDaGlsZHJlbihza2lwSGlkZGVuKVt0aGlzLmluZGV4ICsgc3RlcHNdO1xyXG4gIH1cclxuXHJcbiAgZmluZE5leHRTaWJsaW5nKHNraXBIaWRkZW4gPSBmYWxzZSkge1xyXG4gICAgcmV0dXJuIHRoaXMuX2ZpbmRBZGphY2VudFNpYmxpbmcoKzEsIHNraXBIaWRkZW4pO1xyXG4gIH1cclxuXHJcbiAgZmluZFByZXZpb3VzU2libGluZyhza2lwSGlkZGVuID0gZmFsc2UpIHtcclxuICAgIHJldHVybiB0aGlzLl9maW5kQWRqYWNlbnRTaWJsaW5nKC0xLCBza2lwSGlkZGVuKTtcclxuICB9XHJcblxyXG4gIGdldFZpc2libGVDaGlsZHJlbigpIHtcclxuICAgIHJldHVybiB0aGlzLnZpc2libGVDaGlsZHJlbjtcclxuICB9XHJcblxyXG4gIEBjb21wdXRlZCBnZXQgdmlzaWJsZUNoaWxkcmVuKCkge1xyXG4gICAgcmV0dXJuICh0aGlzLmNoaWxkcmVuIHx8IFtdKS5maWx0ZXIoKG5vZGUpID0+ICFub2RlLmlzSGlkZGVuKTtcclxuICB9XHJcblxyXG4gIGdldEZpcnN0Q2hpbGQoc2tpcEhpZGRlbiA9IGZhbHNlKSB7XHJcbiAgICBsZXQgY2hpbGRyZW4gPSBza2lwSGlkZGVuID8gdGhpcy52aXNpYmxlQ2hpbGRyZW4gOiB0aGlzLmNoaWxkcmVuO1xyXG5cclxuICAgIHJldHVybiBmaXJzdChjaGlsZHJlbiB8fCBbXSk7XHJcbiAgfVxyXG5cclxuICBnZXRMYXN0Q2hpbGQoc2tpcEhpZGRlbiA9IGZhbHNlKSB7XHJcbiAgICBsZXQgY2hpbGRyZW4gPSBza2lwSGlkZGVuID8gdGhpcy52aXNpYmxlQ2hpbGRyZW4gOiB0aGlzLmNoaWxkcmVuO1xyXG5cclxuICAgIHJldHVybiBsYXN0KGNoaWxkcmVuIHx8IFtdKTtcclxuICB9XHJcblxyXG4gIGZpbmROZXh0Tm9kZShnb0luc2lkZSA9IHRydWUsIHNraXBIaWRkZW4gPSBmYWxzZSkge1xyXG4gICAgcmV0dXJuIGdvSW5zaWRlICYmIHRoaXMuaXNFeHBhbmRlZCAmJiB0aGlzLmdldEZpcnN0Q2hpbGQoc2tpcEhpZGRlbikgfHxcclxuICAgICAgICAgICB0aGlzLmZpbmROZXh0U2libGluZyhza2lwSGlkZGVuKSB8fFxyXG4gICAgICAgICAgIHRoaXMucGFyZW50ICYmIHRoaXMucGFyZW50LmZpbmROZXh0Tm9kZShmYWxzZSwgc2tpcEhpZGRlbik7XHJcbiAgfVxyXG5cclxuICBmaW5kUHJldmlvdXNOb2RlKHNraXBIaWRkZW4gPSBmYWxzZSkge1xyXG4gICAgbGV0IHByZXZpb3VzU2libGluZyA9IHRoaXMuZmluZFByZXZpb3VzU2libGluZyhza2lwSGlkZGVuKTtcclxuICAgIGlmICghcHJldmlvdXNTaWJsaW5nKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLnJlYWxQYXJlbnQ7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcHJldmlvdXNTaWJsaW5nLl9nZXRMYXN0T3BlbkRlc2NlbmRhbnQoc2tpcEhpZGRlbik7XHJcbiAgfVxyXG5cclxuICBfZ2V0TGFzdE9wZW5EZXNjZW5kYW50KHNraXBIaWRkZW4gPSBmYWxzZSkge1xyXG4gICAgY29uc3QgbGFzdENoaWxkID0gdGhpcy5nZXRMYXN0Q2hpbGQoc2tpcEhpZGRlbik7XHJcbiAgICByZXR1cm4gKHRoaXMuaXNDb2xsYXBzZWQgfHwgIWxhc3RDaGlsZClcclxuICAgICAgPyB0aGlzXHJcbiAgICAgIDogbGFzdENoaWxkLl9nZXRMYXN0T3BlbkRlc2NlbmRhbnQoc2tpcEhpZGRlbik7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIF9nZXRQYXJlbnRzQ2hpbGRyZW4oc2tpcEhpZGRlbiA9IGZhbHNlKTogYW55W10ge1xyXG4gICAgY29uc3QgY2hpbGRyZW4gPSB0aGlzLnBhcmVudCAmJlxyXG4gICAgICAoc2tpcEhpZGRlbiA/IHRoaXMucGFyZW50LmdldFZpc2libGVDaGlsZHJlbigpIDogdGhpcy5wYXJlbnQuY2hpbGRyZW4pO1xyXG5cclxuICAgIHJldHVybiBjaGlsZHJlbiB8fCBbXTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0SW5kZXhJblBhcmVudChza2lwSGlkZGVuID0gZmFsc2UpIHtcclxuICAgIHJldHVybiB0aGlzLl9nZXRQYXJlbnRzQ2hpbGRyZW4oc2tpcEhpZGRlbikuaW5kZXhPZih0aGlzKTtcclxuICB9XHJcblxyXG4gIGlzRGVzY2VuZGFudE9mKG5vZGU6IFRyZWVOb2RlKSB7XHJcbiAgICBpZiAodGhpcyA9PT0gbm9kZSkgcmV0dXJuIHRydWU7XHJcbiAgICBlbHNlIHJldHVybiB0aGlzLnBhcmVudCAmJiB0aGlzLnBhcmVudC5pc0Rlc2NlbmRhbnRPZihub2RlKTtcclxuICB9XHJcblxyXG4gIGdldE5vZGVQYWRkaW5nKCk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLmxldmVsUGFkZGluZyAqICh0aGlzLmxldmVsIC0gMSkgKyAncHgnO1xyXG4gIH1cclxuXHJcbiAgZ2V0Q2xhc3MoKTogc3RyaW5nIHtcclxuICAgIHJldHVybiBbdGhpcy5vcHRpb25zLm5vZGVDbGFzcyh0aGlzKSwgYHRyZWUtbm9kZS1sZXZlbC0keyB0aGlzLmxldmVsIH1gXS5qb2luKCcgJyk7XHJcbiAgfVxyXG5cclxuICBvbkRyb3AoJGV2ZW50KSB7XHJcbiAgICB0aGlzLm1vdXNlQWN0aW9uKCdkcm9wJywgJGV2ZW50LmV2ZW50LCB7XHJcbiAgICAgIGZyb206ICRldmVudC5lbGVtZW50LFxyXG4gICAgICB0bzogeyBwYXJlbnQ6IHRoaXMsIGluZGV4OiAwLCBkcm9wT25Ob2RlOiB0cnVlIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgYWxsb3dEcm9wID0gKGVsZW1lbnQsICRldmVudD8pID0+IHtcclxuICAgIHJldHVybiB0aGlzLm9wdGlvbnMuYWxsb3dEcm9wKGVsZW1lbnQsIHsgcGFyZW50OiB0aGlzLCBpbmRleDogMCB9LCAkZXZlbnQpO1xyXG4gIH1cclxuXHJcbiAgYWxsb3dEcmFnKCkge1xyXG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy5hbGxvd0RyYWcodGhpcyk7XHJcbiAgfVxyXG5cclxuXHJcbiAgLy8gaGVscGVyIG1ldGhvZHM6XHJcbiAgbG9hZE5vZGVDaGlsZHJlbigpIHtcclxuICAgIGlmICghdGhpcy5vcHRpb25zLmdldENoaWxkcmVuKSB7XHJcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTsgLy8gTm90IGdldENoaWxkcmVuIG1ldGhvZCAtIGZvciB1c2luZyByZWR1eFxyXG4gICAgfVxyXG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLm9wdGlvbnMuZ2V0Q2hpbGRyZW4odGhpcykpXHJcbiAgICAgIC50aGVuKChjaGlsZHJlbikgPT4ge1xyXG4gICAgICAgIGlmIChjaGlsZHJlbikge1xyXG4gICAgICAgICAgdGhpcy5zZXRGaWVsZCgnY2hpbGRyZW4nLCBjaGlsZHJlbik7XHJcbiAgICAgICAgICB0aGlzLl9pbml0Q2hpbGRyZW4oKTtcclxuICAgICAgICAgIHRoaXMuY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGQpID0+IHtcclxuICAgICAgICAgICAgaWYgKGNoaWxkLmdldEZpZWxkKCdpc0V4cGFuZGVkJykgJiYgY2hpbGQuaGFzQ2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICBjaGlsZC5leHBhbmQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgIH19KS50aGVuKCgpID0+IHtcclxuICAgICAgICB0aGlzLmZpcmVFdmVudCh7XHJcbiAgICAgICAgICBldmVudE5hbWU6IFRSRUVfRVZFTlRTLmxvYWROb2RlQ2hpbGRyZW4sXHJcbiAgICAgICAgICBub2RlOiB0aGlzXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgZXhwYW5kKCkge1xyXG4gICAgaWYgKCF0aGlzLmlzRXhwYW5kZWQpIHtcclxuICAgICAgcmV0dXJuIHRoaXMudG9nZ2xlRXhwYW5kZWQoKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XHJcbiAgfVxyXG5cclxuICBjb2xsYXBzZSgpIHtcclxuICAgIGlmICh0aGlzLmlzRXhwYW5kZWQpIHtcclxuICAgICAgdGhpcy50b2dnbGVFeHBhbmRlZCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgZG9Gb3JBbGwoZm46IChub2RlOiBJVHJlZU5vZGUpID0+IGFueSkge1xyXG4gICAgUHJvbWlzZS5yZXNvbHZlKGZuKHRoaXMpKS50aGVuKCgpID0+IHtcclxuICAgICAgaWYgKHRoaXMuY2hpbGRyZW4pIHtcclxuICAgICAgICB0aGlzLmNoaWxkcmVuLmZvckVhY2goKGNoaWxkKSA9PiBjaGlsZC5kb0ZvckFsbChmbikpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGV4cGFuZEFsbCgpIHtcclxuICAgIHRoaXMuZG9Gb3JBbGwoKG5vZGUpID0+IG5vZGUuZXhwYW5kKCkpO1xyXG4gIH1cclxuXHJcbiAgY29sbGFwc2VBbGwoKSB7XHJcbiAgICB0aGlzLmRvRm9yQWxsKChub2RlKSA9PiBub2RlLmNvbGxhcHNlKCkpO1xyXG4gIH1cclxuXHJcbiAgZW5zdXJlVmlzaWJsZSgpIHtcclxuICAgIGlmICh0aGlzLnJlYWxQYXJlbnQpIHtcclxuICAgICAgdGhpcy5yZWFsUGFyZW50LmV4cGFuZCgpO1xyXG4gICAgICB0aGlzLnJlYWxQYXJlbnQuZW5zdXJlVmlzaWJsZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgdG9nZ2xlRXhwYW5kZWQoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5zZXRJc0V4cGFuZGVkKCF0aGlzLmlzRXhwYW5kZWQpO1xyXG4gIH1cclxuXHJcbiAgc2V0SXNFeHBhbmRlZCh2YWx1ZSkge1xyXG4gICAgaWYgKHRoaXMuaGFzQ2hpbGRyZW4pIHtcclxuICAgICAgdGhpcy50cmVlTW9kZWwuc2V0RXhwYW5kZWROb2RlKHRoaXMsIHZhbHVlKTtcclxuXHJcbiAgICAgIGlmICghdGhpcy5jaGlsZHJlbiAmJiB0aGlzLmhhc0NoaWxkcmVuICYmIHZhbHVlKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubG9hZE5vZGVDaGlsZHJlbigpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xyXG4gIH07XHJcblxyXG4gIHNldElzQWN0aXZlKHZhbHVlLCBtdWx0aSA9IGZhbHNlKSB7XHJcbiAgICB0aGlzLnRyZWVNb2RlbC5zZXRBY3RpdmVOb2RlKHRoaXMsIHZhbHVlLCBtdWx0aSk7XHJcbiAgICBpZiAodmFsdWUpIHtcclxuICAgICAgdGhpcy5mb2N1cyh0aGlzLm9wdGlvbnMuc2Nyb2xsT25TZWxlY3QpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgdG9nZ2xlQWN0aXZhdGVkKG11bHRpID0gZmFsc2UpIHtcclxuICAgIHRoaXMuc2V0SXNBY3RpdmUoIXRoaXMuaXNBY3RpdmUsIG11bHRpKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIHNldEFjdGl2ZUFuZFZpc2libGUobXVsdGkgPSBmYWxzZSkge1xyXG4gICAgdGhpcy5zZXRJc0FjdGl2ZSh0cnVlLCBtdWx0aSlcclxuICAgICAgLmVuc3VyZVZpc2libGUoKTtcclxuXHJcbiAgICBzZXRUaW1lb3V0KHRoaXMuc2Nyb2xsSW50b1ZpZXcuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICBzY3JvbGxJbnRvVmlldyhmb3JjZSA9IGZhbHNlKSB7XHJcbiAgICB0aGlzLnRyZWVNb2RlbC52aXJ0dWFsU2Nyb2xsLnNjcm9sbEludG9WaWV3KHRoaXMsIGZvcmNlKTtcclxuICB9XHJcblxyXG4gIGZvY3VzKHNjcm9sbCA9IHRydWUpIHtcclxuICAgIGxldCBwcmV2aW91c05vZGUgPSB0aGlzLnRyZWVNb2RlbC5nZXRGb2N1c2VkTm9kZSgpO1xyXG4gICAgdGhpcy50cmVlTW9kZWwuc2V0Rm9jdXNlZE5vZGUodGhpcyk7XHJcbiAgICBpZiAoc2Nyb2xsKSB7XHJcbiAgICAgIHRoaXMuc2Nyb2xsSW50b1ZpZXcoKTtcclxuICAgIH1cclxuICAgIGlmIChwcmV2aW91c05vZGUpIHtcclxuICAgICAgdGhpcy5maXJlRXZlbnQoeyBldmVudE5hbWU6IFRSRUVfRVZFTlRTLmJsdXIsIG5vZGU6IHByZXZpb3VzTm9kZSB9KTtcclxuICAgIH1cclxuICAgIHRoaXMuZmlyZUV2ZW50KHsgZXZlbnROYW1lOiBUUkVFX0VWRU5UUy5mb2N1cywgbm9kZTogdGhpcyB9KTtcclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIGJsdXIoKSB7XHJcbiAgICBsZXQgcHJldmlvdXNOb2RlID0gdGhpcy50cmVlTW9kZWwuZ2V0Rm9jdXNlZE5vZGUoKTtcclxuICAgIHRoaXMudHJlZU1vZGVsLnNldEZvY3VzZWROb2RlKG51bGwpO1xyXG4gICAgaWYgKHByZXZpb3VzTm9kZSkge1xyXG4gICAgICB0aGlzLmZpcmVFdmVudCh7IGV2ZW50TmFtZTogVFJFRV9FVkVOVFMuYmx1ciwgbm9kZTogdGhpcyB9KTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIHNldElzSGlkZGVuKHZhbHVlKSB7XHJcbiAgICB0aGlzLnRyZWVNb2RlbC5zZXRJc0hpZGRlbih0aGlzLCB2YWx1ZSk7XHJcbiAgfVxyXG5cclxuICBoaWRlKCkge1xyXG4gICAgdGhpcy5zZXRJc0hpZGRlbih0cnVlKTtcclxuICB9XHJcblxyXG4gIHNob3coKSB7XHJcbiAgICB0aGlzLnNldElzSGlkZGVuKGZhbHNlKTtcclxuICB9XHJcblxyXG4gIG1vdXNlQWN0aW9uKGFjdGlvbk5hbWU6IHN0cmluZywgJGV2ZW50LCBkYXRhOiBhbnkgPSBudWxsKSB7XHJcbiAgICB0aGlzLnRyZWVNb2RlbC5zZXRGb2N1cyh0cnVlKTtcclxuXHJcbiAgICBjb25zdCBhY3Rpb25NYXBwaW5nID0gdGhpcy5vcHRpb25zLmFjdGlvbk1hcHBpbmcubW91c2U7XHJcbiAgICBjb25zdCBhY3Rpb24gPSBhY3Rpb25NYXBwaW5nW2FjdGlvbk5hbWVdO1xyXG5cclxuICAgIGlmIChhY3Rpb24pIHtcclxuICAgICAgYWN0aW9uKHRoaXMudHJlZU1vZGVsLCB0aGlzLCAkZXZlbnQsIGRhdGEpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZ2V0U2VsZkhlaWdodCgpIHtcclxuICAgIHJldHVybiB0aGlzLm9wdGlvbnMubm9kZUhlaWdodCh0aGlzKTtcclxuICB9XHJcblxyXG4gIEBhY3Rpb24gX2luaXRDaGlsZHJlbigpIHtcclxuICAgIHRoaXMuY2hpbGRyZW4gPSB0aGlzLmdldEZpZWxkKCdjaGlsZHJlbicpXHJcbiAgICAgIC5tYXAoKGMsIGluZGV4KSA9PiBuZXcgVHJlZU5vZGUoYywgdGhpcywgdGhpcy50cmVlTW9kZWwsIGluZGV4KSk7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiB1dWlkKCkge1xyXG4gIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMDAwMDAwMDAwMDAwMCk7XHJcbn1cclxuIl19