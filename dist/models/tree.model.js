var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@angular/core';
import { observable, computed, action, autorun } from 'mobx';
import { TreeNode } from './tree-node.model';
import { TreeOptions } from './tree-options.model';
import { TREE_EVENTS } from '../constants/events';
import * as _ from 'lodash';
var first = _.first, last = _.last, compact = _.compact, find = _.find, includes = _.includes, isString = _.isString, isFunction = _.isFunction;
var TreeModel = /** @class */ (function () {
    function TreeModel() {
        this.options = new TreeOptions();
        this.eventNames = Object.keys(TREE_EVENTS);
        this.expandedNodeIds = {};
        this.activeNodeIds = {};
        this.hiddenNodeIds = {};
        this.focusedNodeId = null;
        this.firstUpdate = true;
    }
    // events
    TreeModel.prototype.fireEvent = function (event) {
        event.treeModel = this;
        this.events[event.eventName].emit(event);
        this.events.event.emit(event);
    };
    TreeModel.prototype.subscribe = function (eventName, fn) {
        this.events[eventName].subscribe(fn);
    };
    // getters
    TreeModel.prototype.getFocusedNode = function () {
        return this.focusedNode;
    };
    TreeModel.prototype.getActiveNode = function () {
        return this.activeNodes[0];
    };
    TreeModel.prototype.getActiveNodes = function () {
        return this.activeNodes;
    };
    TreeModel.prototype.getVisibleRoots = function () {
        return this.virtualRoot.visibleChildren;
    };
    TreeModel.prototype.getFirstRoot = function (skipHidden) {
        if (skipHidden === void 0) { skipHidden = false; }
        return first(skipHidden ? this.getVisibleRoots() : this.roots);
    };
    TreeModel.prototype.getLastRoot = function (skipHidden) {
        if (skipHidden === void 0) { skipHidden = false; }
        return last(skipHidden ? this.getVisibleRoots() : this.roots);
    };
    Object.defineProperty(TreeModel.prototype, "isFocused", {
        get: function () {
            return TreeModel.focusedTree === this;
        },
        enumerable: true,
        configurable: true
    });
    TreeModel.prototype.isNodeFocused = function (node) {
        return this.focusedNode === node;
    };
    TreeModel.prototype.isEmptyTree = function () {
        return this.roots && this.roots.length === 0;
    };
    Object.defineProperty(TreeModel.prototype, "focusedNode", {
        get: function () {
            return this.focusedNodeId ? this.getNodeById(this.focusedNodeId) : null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TreeModel.prototype, "expandedNodes", {
        get: function () {
            var _this = this;
            var nodes = Object.keys(this.expandedNodeIds)
                .filter(function (id) { return _this.expandedNodeIds[id]; })
                .map(function (id) { return _this.getNodeById(id); });
            return compact(nodes);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TreeModel.prototype, "activeNodes", {
        get: function () {
            var _this = this;
            var nodes = Object.keys(this.activeNodeIds)
                .filter(function (id) { return _this.activeNodeIds[id]; })
                .map(function (id) { return _this.getNodeById(id); });
            return compact(nodes);
        },
        enumerable: true,
        configurable: true
    });
    // locating nodes
    TreeModel.prototype.getNodeByPath = function (path, startNode) {
        if (startNode === void 0) { startNode = null; }
        if (!path)
            return null;
        startNode = startNode || this.virtualRoot;
        if (path.length === 0)
            return startNode;
        if (!startNode.children)
            return null;
        var childId = path.shift();
        var childNode = find(startNode.children, { id: childId });
        if (!childNode)
            return null;
        return this.getNodeByPath(path, childNode);
    };
    TreeModel.prototype.getNodeById = function (id) {
        var idStr = id.toString();
        return this.getNodeBy(function (node) { return node.id.toString() === idStr; });
    };
    TreeModel.prototype.getNodeBy = function (predicate, startNode) {
        if (startNode === void 0) { startNode = null; }
        startNode = startNode || this.virtualRoot;
        if (!startNode.children)
            return null;
        var found = find(startNode.children, predicate);
        if (found) {
            return found;
        }
        else {
            for (var _i = 0, _a = startNode.children; _i < _a.length; _i++) {
                var child = _a[_i];
                var foundInChildren = this.getNodeBy(predicate, child);
                if (foundInChildren)
                    return foundInChildren;
            }
        }
    };
    TreeModel.prototype.isExpanded = function (node) {
        return this.expandedNodeIds[node.id];
    };
    TreeModel.prototype.isHidden = function (node) {
        return this.hiddenNodeIds[node.id];
    };
    TreeModel.prototype.isActive = function (node) {
        return this.activeNodeIds[node.id];
    };
    // actions
    TreeModel.prototype.setData = function (_a) {
        var nodes = _a.nodes, _b = _a.options, options = _b === void 0 ? null : _b, _c = _a.events, events = _c === void 0 ? null : _c;
        if (options) {
            this.options = new TreeOptions(options);
        }
        if (events) {
            this.events = events;
        }
        if (nodes) {
            this.nodes = nodes;
        }
        this.update();
    };
    TreeModel.prototype.update = function () {
        // Rebuild tree:
        var virtualRootConfig = (_a = {
                id: this.options.rootId,
                virtual: true
            },
            _a[this.options.childrenField] = this.nodes,
            _a);
        this.virtualRoot = new TreeNode(virtualRootConfig, null, this, 0);
        this.roots = this.virtualRoot.children;
        // Fire event:
        if (this.firstUpdate) {
            if (this.roots) {
                this.firstUpdate = false;
                this._calculateExpandedNodes();
            }
        }
        else {
            this.fireEvent({ eventName: TREE_EVENTS.updateData });
        }
        var _a;
    };
    TreeModel.prototype.setFocusedNode = function (node) {
        this.focusedNodeId = node ? node.id : null;
    };
    TreeModel.prototype.setFocus = function (value) {
        TreeModel.focusedTree = value ? this : null;
    };
    TreeModel.prototype.doForAll = function (fn) {
        this.roots.forEach(function (root) { return root.doForAll(fn); });
    };
    TreeModel.prototype.focusNextNode = function () {
        var previousNode = this.getFocusedNode();
        var nextNode = previousNode ? previousNode.findNextNode(true, true) : this.getFirstRoot(true);
        if (nextNode)
            nextNode.focus();
    };
    TreeModel.prototype.focusPreviousNode = function () {
        var previousNode = this.getFocusedNode();
        var nextNode = previousNode ? previousNode.findPreviousNode(true) : this.getLastRoot(true);
        if (nextNode)
            nextNode.focus();
    };
    TreeModel.prototype.focusDrillDown = function () {
        var previousNode = this.getFocusedNode();
        if (previousNode && previousNode.isCollapsed && previousNode.hasChildren) {
            previousNode.toggleExpanded();
        }
        else {
            var nextNode = previousNode ? previousNode.getFirstChild(true) : this.getFirstRoot(true);
            if (nextNode)
                nextNode.focus();
        }
    };
    TreeModel.prototype.focusDrillUp = function () {
        var previousNode = this.getFocusedNode();
        if (!previousNode)
            return;
        if (previousNode.isExpanded) {
            previousNode.toggleExpanded();
        }
        else {
            var nextNode = previousNode.realParent;
            if (nextNode)
                nextNode.focus();
        }
    };
    TreeModel.prototype.setActiveNode = function (node, value, multi) {
        if (multi === void 0) { multi = false; }
        if (multi) {
            this._setActiveNodeMulti(node, value);
        }
        else {
            this._setActiveNodeSingle(node, value);
        }
        if (value) {
            node.focus();
            this.fireEvent({ eventName: TREE_EVENTS.activate, node: node });
        }
        else {
            this.fireEvent({ eventName: TREE_EVENTS.deactivate, node: node });
        }
    };
    TreeModel.prototype.setExpandedNode = function (node, value) {
        this.expandedNodeIds = Object.assign({}, this.expandedNodeIds, (_a = {}, _a[node.id] = value, _a));
        this.fireEvent({ eventName: TREE_EVENTS.toggleExpanded, node: node, isExpanded: value });
        var _a;
    };
    TreeModel.prototype.expandAll = function () {
        this.roots.forEach(function (root) { return root.expandAll(); });
    };
    TreeModel.prototype.collapseAll = function () {
        this.roots.forEach(function (root) { return root.collapseAll(); });
    };
    TreeModel.prototype.setIsHidden = function (node, value) {
        this.hiddenNodeIds = Object.assign({}, this.hiddenNodeIds, (_a = {}, _a[node.id] = value, _a));
        var _a;
    };
    TreeModel.prototype.setHiddenNodeIds = function (nodeIds) {
        this.hiddenNodeIds = nodeIds.reduce(function (id, hiddenNodeIds) {
            return Object.assign(hiddenNodeIds, (_a = {},
                _a[id] = true,
                _a));
            var _a;
        }, {});
    };
    TreeModel.prototype.performKeyAction = function (node, $event) {
        var action = this.options.actionMapping.keys[$event.keyCode];
        if (action) {
            $event.preventDefault();
            action(this, node, $event);
            return true;
        }
        else {
            return false;
        }
    };
    TreeModel.prototype.filterNodes = function (filter, autoShow) {
        var _this = this;
        if (autoShow === void 0) { autoShow = true; }
        var filterFn;
        if (!filter) {
            return this.clearFilter();
        }
        // support function and string filter
        if (isString(filter)) {
            filterFn = function (node) { return node.displayField.toLowerCase().indexOf(filter.toLowerCase()) !== -1; };
        }
        else if (isFunction(filter)) {
            filterFn = filter;
        }
        else {
            console.error('Don\'t know what to do with filter', filter);
            console.error('Should be either a string or function');
            return;
        }
        var ids = {};
        this.roots.forEach(function (node) { return _this._filterNode(ids, node, filterFn, autoShow); });
        this.hiddenNodeIds = ids;
        this.fireEvent({ eventName: TREE_EVENTS.changeFilter });
    };
    TreeModel.prototype.clearFilter = function () {
        this.hiddenNodeIds = {};
        this.fireEvent({ eventName: TREE_EVENTS.changeFilter });
    };
    TreeModel.prototype.moveNode = function (node, to) {
        var fromIndex = node.getIndexInParent();
        var fromParent = node.parent;
        if (!this._canMoveNode(node, fromIndex, to))
            return;
        var fromChildren = fromParent.getField('children');
        // If node doesn't have children - create children array
        if (!to.parent.getField('children')) {
            to.parent.setField('children', []);
        }
        var toChildren = to.parent.getField('children');
        var originalNode = fromChildren.splice(fromIndex, 1)[0];
        // Compensate for index if already removed from parent:
        var toIndex = (fromParent === to.parent && to.index > fromIndex) ? to.index - 1 : to.index;
        toChildren.splice(toIndex, 0, originalNode);
        fromParent.treeModel.update();
        if (to.parent.treeModel !== fromParent.treeModel) {
            to.parent.treeModel.update();
        }
        this.fireEvent({ eventName: TREE_EVENTS.moveNode, node: originalNode, to: { parent: to.parent.data, index: toIndex } });
    };
    TreeModel.prototype.copyNode = function (node, to) {
        var fromIndex = node.getIndexInParent();
        if (!this._canMoveNode(node, fromIndex, to))
            return;
        // If node doesn't have children - create children array
        if (!to.parent.getField('children')) {
            to.parent.setField('children', []);
        }
        var toChildren = to.parent.getField('children');
        var nodeCopy = this.options.getNodeClone(node);
        toChildren.splice(to.index, 0, nodeCopy);
        node.treeModel.update();
        if (to.parent.treeModel !== node.treeModel) {
            to.parent.treeModel.update();
        }
        this.fireEvent({ eventName: TREE_EVENTS.copyNode, node: nodeCopy, to: { parent: to.parent.data, index: to.index } });
    };
    TreeModel.prototype.getState = function () {
        return {
            expandedNodeIds: this.expandedNodeIds,
            activeNodeIds: this.activeNodeIds,
            hiddenNodeIds: this.hiddenNodeIds,
            focusedNodeId: this.focusedNodeId
        };
    };
    TreeModel.prototype.setState = function (state) {
        if (!state)
            return;
        Object.assign(this, {
            expandedNodeIds: state.expandedNodeIds || {},
            activeNodeIds: state.activeNodeIds || {},
            hiddenNodeIds: state.hiddenNodeIds || {},
            focusedNodeId: state.focusedNodeId
        });
    };
    TreeModel.prototype.subscribeToState = function (fn) {
        var _this = this;
        autorun(function () { return fn(_this.getState()); });
    };
    // private methods
    TreeModel.prototype._canMoveNode = function (node, fromIndex, to) {
        // same node:
        if (node.parent === to.parent && fromIndex === to.index) {
            return false;
        }
        return !to.parent.isDescendantOf(node);
    };
    TreeModel.prototype._filterNode = function (ids, node, filterFn, autoShow) {
        var _this = this;
        // if node passes function then it's visible
        var isVisible = filterFn(node);
        if (node.children) {
            // if one of node's children passes filter then this node is also visible
            node.children.forEach(function (child) {
                if (_this._filterNode(ids, child, filterFn, autoShow)) {
                    isVisible = true;
                }
            });
        }
        // mark node as hidden
        if (!isVisible) {
            ids[node.id] = true;
        }
        // auto expand parents to make sure the filtered nodes are visible
        if (autoShow && isVisible) {
            node.ensureVisible();
        }
        return isVisible;
    };
    TreeModel.prototype._calculateExpandedNodes = function (startNode) {
        var _this = this;
        if (startNode === void 0) { startNode = null; }
        startNode = startNode || this.virtualRoot;
        if (startNode.data[this.options.isExpandedField]) {
            this.expandedNodeIds = Object.assign({}, this.expandedNodeIds, (_a = {}, _a[startNode.id] = true, _a));
        }
        if (startNode.children) {
            startNode.children.forEach(function (child) { return _this._calculateExpandedNodes(child); });
        }
        var _a;
    };
    TreeModel.prototype._setActiveNodeSingle = function (node, value) {
        var _this = this;
        // Deactivate all other nodes:
        this.activeNodes
            .filter(function (activeNode) { return activeNode !== node; })
            .forEach(function (activeNode) {
            _this.fireEvent({ eventName: TREE_EVENTS.deactivate, node: activeNode });
        });
        if (value) {
            this.activeNodeIds = (_a = {}, _a[node.id] = true, _a);
        }
        else {
            this.activeNodeIds = {};
        }
        var _a;
    };
    TreeModel.prototype._setActiveNodeMulti = function (node, value) {
        this.activeNodeIds = Object.assign({}, this.activeNodeIds, (_a = {}, _a[node.id] = value, _a));
        var _a;
    };
    TreeModel.focusedTree = null;
    TreeModel.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    TreeModel.ctorParameters = function () { return []; };
    __decorate([
        observable,
        __metadata("design:type", Array)
    ], TreeModel.prototype, "roots", void 0);
    __decorate([
        observable,
        __metadata("design:type", Object)
    ], TreeModel.prototype, "expandedNodeIds", void 0);
    __decorate([
        observable,
        __metadata("design:type", Object)
    ], TreeModel.prototype, "activeNodeIds", void 0);
    __decorate([
        observable,
        __metadata("design:type", Object)
    ], TreeModel.prototype, "hiddenNodeIds", void 0);
    __decorate([
        observable,
        __metadata("design:type", Object)
    ], TreeModel.prototype, "focusedNodeId", void 0);
    __decorate([
        observable,
        __metadata("design:type", TreeNode)
    ], TreeModel.prototype, "virtualRoot", void 0);
    __decorate([
        computed,
        __metadata("design:type", Object),
        __metadata("design:paramtypes", [])
    ], TreeModel.prototype, "focusedNode", null);
    __decorate([
        computed,
        __metadata("design:type", Object),
        __metadata("design:paramtypes", [])
    ], TreeModel.prototype, "expandedNodes", null);
    __decorate([
        computed,
        __metadata("design:type", Object),
        __metadata("design:paramtypes", [])
    ], TreeModel.prototype, "activeNodes", null);
    __decorate([
        action,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", void 0)
    ], TreeModel.prototype, "setData", null);
    __decorate([
        action,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], TreeModel.prototype, "update", null);
    __decorate([
        action,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", void 0)
    ], TreeModel.prototype, "setFocusedNode", null);
    __decorate([
        action,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", void 0)
    ], TreeModel.prototype, "setFocus", null);
    __decorate([
        action,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", void 0)
    ], TreeModel.prototype, "doForAll", null);
    __decorate([
        action,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], TreeModel.prototype, "focusNextNode", null);
    __decorate([
        action,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], TreeModel.prototype, "focusPreviousNode", null);
    __decorate([
        action,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], TreeModel.prototype, "focusDrillDown", null);
    __decorate([
        action,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], TreeModel.prototype, "focusDrillUp", null);
    __decorate([
        action,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Object, Object]),
        __metadata("design:returntype", void 0)
    ], TreeModel.prototype, "setActiveNode", null);
    __decorate([
        action,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Object]),
        __metadata("design:returntype", void 0)
    ], TreeModel.prototype, "setExpandedNode", null);
    __decorate([
        action,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], TreeModel.prototype, "expandAll", null);
    __decorate([
        action,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], TreeModel.prototype, "collapseAll", null);
    __decorate([
        action,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Object]),
        __metadata("design:returntype", void 0)
    ], TreeModel.prototype, "setIsHidden", null);
    __decorate([
        action,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", void 0)
    ], TreeModel.prototype, "setHiddenNodeIds", null);
    __decorate([
        action,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Object]),
        __metadata("design:returntype", void 0)
    ], TreeModel.prototype, "filterNodes", null);
    __decorate([
        action,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], TreeModel.prototype, "clearFilter", null);
    __decorate([
        action,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Object]),
        __metadata("design:returntype", void 0)
    ], TreeModel.prototype, "moveNode", null);
    __decorate([
        action,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Object]),
        __metadata("design:returntype", void 0)
    ], TreeModel.prototype, "copyNode", null);
    __decorate([
        action,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", void 0)
    ], TreeModel.prototype, "setState", null);
    return TreeModel;
}());
export { TreeModel };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9tb2RlbHMvdHJlZS5tb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxPQUFPLEVBQUUsVUFBQSxFQUF5QixNQUFPLGVBQUEsQ0FBZ0I7QUFDekQsT0FBTyxFQUFFLFVBQUEsRUFBWSxRQUFBLEVBQVUsTUFBQSxFQUFRLE9BQUEsRUFBUSxNQUFPLE1BQUEsQ0FBTztBQUM3RCxPQUFPLEVBQUUsUUFBQSxFQUFTLE1BQU8sbUJBQUEsQ0FBb0I7QUFDN0MsT0FBTyxFQUFFLFdBQUEsRUFBWSxNQUFPLHNCQUFBLENBQXVCO0FBR25ELE9BQU8sRUFBRSxXQUFBLEVBQVksTUFBTyxxQkFBQSxDQUFzQjtBQUVsRCxPQUFPLEtBQUssQ0FBQSxNQUFPLFFBQUEsQ0FBUztBQUVwQixJQUFBLGVBQUEsRUFBTyxhQUFBLEVBQU0sbUJBQUEsRUFBUyxhQUFBLEVBQU0scUJBQUEsRUFBVSxxQkFBQSxFQUFVLHlCQUFBLENBQWlCO0FBR3pFO0lBQUE7UUFHRSxZQUFPLEdBQWdCLElBQUksV0FBVyxFQUFFLENBQUM7UUFFekMsZUFBVSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7UUFJMUIsb0JBQWUsR0FBcUIsRUFBRSxDQUFDO1FBQ3ZDLGtCQUFhLEdBQXFCLEVBQUUsQ0FBQztRQUNyQyxrQkFBYSxHQUFxQixFQUFFLENBQUM7UUFDckMsa0JBQWEsR0FBVyxJQUFJLENBQUM7UUFHakMsZ0JBQVcsR0FBRyxJQUFJLENBQUM7SUF3YjdCLENBQUM7SUFyYkMsU0FBUztJQUNULDZCQUFTLEdBQVQsVUFBVSxLQUFLO1FBQ2IsS0FBSyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7UUFDdkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3pDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNoQyxDQUFDO0lBRUQsNkJBQVMsR0FBVCxVQUFVLFNBQVMsRUFBRSxFQUFFO1FBQ3JCLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFHRCxVQUFVO0lBQ1Ysa0NBQWMsR0FBZDtRQUNFLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDO0lBQzFCLENBQUM7SUFHRCxpQ0FBYSxHQUFiO1FBQ0UsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDN0IsQ0FBQztJQUVELGtDQUFjLEdBQWQ7UUFDRSxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQztJQUMxQixDQUFDO0lBRUQsbUNBQWUsR0FBZjtRQUNFLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQztJQUMxQyxDQUFDO0lBRUQsZ0NBQVksR0FBWixVQUFhLFVBQWtCO1FBQWxCLDJCQUFBLEVBQUEsa0JBQWtCO1FBQzdCLE1BQU0sQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNqRSxDQUFDO0lBRUQsK0JBQVcsR0FBWCxVQUFZLFVBQWtCO1FBQWxCLDJCQUFBLEVBQUEsa0JBQWtCO1FBQzVCLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNoRSxDQUFDO0lBRUQsc0JBQUksZ0NBQVM7YUFBYjtZQUNFLE1BQU0sQ0FBQyxTQUFTLENBQUMsV0FBVyxLQUFLLElBQUksQ0FBQztRQUN4QyxDQUFDOzs7T0FBQTtJQUVELGlDQUFhLEdBQWIsVUFBYyxJQUFJO1FBQ2hCLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxLQUFLLElBQUksQ0FBQztJQUNuQyxDQUFDO0lBRUQsK0JBQVcsR0FBWDtRQUNFLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBRVMsc0JBQUksa0NBQVc7YUFBZjtZQUNSLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQzFFLENBQUM7OztPQUFBO0lBRVMsc0JBQUksb0NBQWE7YUFBakI7WUFBVixpQkFNQztZQUxDLElBQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQztpQkFDNUMsTUFBTSxDQUFDLFVBQUMsRUFBRSxJQUFLLE9BQUEsS0FBSSxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUMsRUFBeEIsQ0FBd0IsQ0FBQztpQkFDeEMsR0FBRyxDQUFDLFVBQUMsRUFBRSxJQUFLLE9BQUEsS0FBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsRUFBcEIsQ0FBb0IsQ0FBQyxDQUFDO1lBRXJDLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDeEIsQ0FBQzs7O09BQUE7SUFFUyxzQkFBSSxrQ0FBVzthQUFmO1lBQVYsaUJBTUM7WUFMQyxJQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUM7aUJBQzFDLE1BQU0sQ0FBQyxVQUFDLEVBQUUsSUFBSyxPQUFBLEtBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLEVBQXRCLENBQXNCLENBQUM7aUJBQ3RDLEdBQUcsQ0FBQyxVQUFDLEVBQUUsSUFBSyxPQUFBLEtBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLEVBQXBCLENBQW9CLENBQUMsQ0FBQztZQUVyQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3hCLENBQUM7OztPQUFBO0lBRUQsaUJBQWlCO0lBQ2pCLGlDQUFhLEdBQWIsVUFBYyxJQUFXLEVBQUUsU0FBZTtRQUFmLDBCQUFBLEVBQUEsZ0JBQWU7UUFDeEMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBRXZCLFNBQVMsR0FBRyxTQUFTLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQztRQUMxQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQztZQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUM7UUFFeEMsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDO1lBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztRQUVyQyxJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDN0IsSUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUU1RCxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFFNUIsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQzdDLENBQUM7SUFFRCwrQkFBVyxHQUFYLFVBQVksRUFBRTtRQUNaLElBQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUU1QixNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFDLElBQUksSUFBSyxPQUFBLElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLEtBQUssS0FBSyxFQUE1QixDQUE0QixDQUFDLENBQUM7SUFDaEUsQ0FBQztJQUVELDZCQUFTLEdBQVQsVUFBVSxTQUFTLEVBQUUsU0FBZ0I7UUFBaEIsMEJBQUEsRUFBQSxnQkFBZ0I7UUFDbkMsU0FBUyxHQUFHLFNBQVMsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDO1FBRTFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQztZQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFFckMsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFFbEQsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNWLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDZixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixHQUFHLENBQUMsQ0FBYyxVQUFrQixFQUFsQixLQUFBLFNBQVMsQ0FBQyxRQUFRLEVBQWxCLGNBQWtCLEVBQWxCLElBQWtCO2dCQUEvQixJQUFJLEtBQUssU0FBQTtnQkFDWixJQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDekQsRUFBRSxDQUFDLENBQUMsZUFBZSxDQUFDO29CQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUM7YUFDN0M7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQUVELDhCQUFVLEdBQVYsVUFBVyxJQUFJO1FBQ2IsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFFRCw0QkFBUSxHQUFSLFVBQVMsSUFBSTtRQUNYLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRUQsNEJBQVEsR0FBUixVQUFTLElBQUk7UUFDWCxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUVELFVBQVU7SUFDRiwyQkFBTyxHQUFQLFVBQVEsRUFBaUY7WUFBL0UsZ0JBQUssRUFBRSxlQUFjLEVBQWQsbUNBQWMsRUFBRSxjQUFhLEVBQWIsa0NBQWE7UUFDcEQsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNaLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDMUMsQ0FBQztRQUNELEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDWCxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUN2QixDQUFDO1FBQ0QsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNWLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ3JCLENBQUM7UUFFRCxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDaEIsQ0FBQztJQUVPLDBCQUFNLEdBQU47UUFDTixnQkFBZ0I7UUFDaEIsSUFBSSxpQkFBaUI7Z0JBQ25CLEVBQUUsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU07Z0JBQ3ZCLE9BQU8sRUFBRSxJQUFJOztZQUNiLEdBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLElBQUcsSUFBSSxDQUFDLEtBQUs7ZUFDekMsQ0FBQztRQUVGLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxRQUFRLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztRQUVsRSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDO1FBRXZDLGNBQWM7UUFDZCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUNyQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDZixJQUFJLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztnQkFDekIsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7WUFDakMsQ0FBQztRQUNILENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxTQUFTLEVBQUUsV0FBVyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7UUFDeEQsQ0FBQzs7SUFDSCxDQUFDO0lBR08sa0NBQWMsR0FBZCxVQUFlLElBQUk7UUFDekIsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztJQUM3QyxDQUFDO0lBRU8sNEJBQVEsR0FBUixVQUFTLEtBQUs7UUFDcEIsU0FBUyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBQzlDLENBQUM7SUFFTyw0QkFBUSxHQUFSLFVBQVMsRUFBRTtRQUNqQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFDLElBQUksSUFBSyxPQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEVBQWpCLENBQWlCLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBRU8saUNBQWEsR0FBYjtRQUNOLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUN6QyxJQUFJLFFBQVEsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzlGLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQztZQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNqQyxDQUFDO0lBRU8scUNBQWlCLEdBQWpCO1FBQ04sSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3pDLElBQUksUUFBUSxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNGLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQztZQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNqQyxDQUFDO0lBRU8sa0NBQWMsR0FBZDtRQUNOLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUN6QyxFQUFFLENBQUMsQ0FBQyxZQUFZLElBQUksWUFBWSxDQUFDLFdBQVcsSUFBSSxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUN6RSxZQUFZLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDaEMsQ0FBQztRQUNELElBQUksQ0FBQyxDQUFDO1lBQ0osSUFBSSxRQUFRLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3pGLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQztnQkFBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDakMsQ0FBQztJQUNILENBQUM7SUFFTyxnQ0FBWSxHQUFaO1FBQ04sSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3pDLEVBQUUsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDO1lBQUMsTUFBTSxDQUFDO1FBQzFCLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQzVCLFlBQVksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUNoQyxDQUFDO1FBQ0QsSUFBSSxDQUFDLENBQUM7WUFDSixJQUFJLFFBQVEsR0FBRyxZQUFZLENBQUMsVUFBVSxDQUFDO1lBQ3ZDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQztnQkFBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDakMsQ0FBQztJQUNILENBQUM7SUFFTyxpQ0FBYSxHQUFiLFVBQWMsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFhO1FBQWIsc0JBQUEsRUFBQSxhQUFhO1FBQzlDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDVixJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3hDLENBQUM7UUFDRCxJQUFJLENBQUMsQ0FBQztZQUNKLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDekMsQ0FBQztRQUVELEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDVixJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDYixJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsU0FBUyxFQUFFLFdBQVcsQ0FBQyxRQUFRLEVBQUUsSUFBSSxNQUFBLEVBQUUsQ0FBQyxDQUFDO1FBQzVELENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxTQUFTLEVBQUUsV0FBVyxDQUFDLFVBQVUsRUFBRSxJQUFJLE1BQUEsRUFBRSxDQUFDLENBQUM7UUFDOUQsQ0FBQztJQUNILENBQUM7SUFFTyxtQ0FBZSxHQUFmLFVBQWdCLElBQUksRUFBRSxLQUFLO1FBQ2pDLElBQUksQ0FBQyxlQUFlLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLGVBQWUsWUFBRyxHQUFDLElBQUksQ0FBQyxFQUFFLElBQUcsS0FBSyxNQUFFLENBQUM7UUFDbkYsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxXQUFXLENBQUMsY0FBYyxFQUFFLElBQUksTUFBQSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDOztJQUNyRixDQUFDO0lBRU8sNkJBQVMsR0FBVDtRQUNOLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQUMsSUFBSSxJQUFLLE9BQUEsSUFBSSxDQUFDLFNBQVMsRUFBRSxFQUFoQixDQUFnQixDQUFDLENBQUM7SUFDakQsQ0FBQztJQUVPLCtCQUFXLEdBQVg7UUFDTixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFDLElBQUksSUFBSyxPQUFBLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBbEIsQ0FBa0IsQ0FBQyxDQUFDO0lBQ25ELENBQUM7SUFFTywrQkFBVyxHQUFYLFVBQVksSUFBSSxFQUFFLEtBQUs7UUFDN0IsSUFBSSxDQUFDLGFBQWEsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsYUFBYSxZQUFHLEdBQUMsSUFBSSxDQUFDLEVBQUUsSUFBRyxLQUFLLE1BQUUsQ0FBQzs7SUFDakYsQ0FBQztJQUVPLG9DQUFnQixHQUFoQixVQUFpQixPQUFPO1FBQzlCLElBQUksQ0FBQyxhQUFhLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxVQUFDLEVBQUUsRUFBRSxhQUFhO1lBQUssT0FBQSxNQUFNLENBQUMsTUFBTSxDQUFDLGFBQWE7Z0JBQ3BGLEdBQUMsRUFBRSxJQUFHLElBQUk7b0JBQ1Y7O1FBRnlELENBRXpELEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDVixDQUFDO0lBRUQsb0NBQWdCLEdBQWhCLFVBQWlCLElBQUksRUFBRSxNQUFNO1FBQzNCLElBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDL0QsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNYLE1BQU0sQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUN4QixNQUFNLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztZQUMzQixNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sTUFBTSxDQUFDLEtBQUssQ0FBQztRQUNmLENBQUM7SUFDSCxDQUFDO0lBRU8sK0JBQVcsR0FBWCxVQUFZLE1BQU0sRUFBRSxRQUFlO1FBQTNDLGlCQXdCQztRQXhCMkIseUJBQUEsRUFBQSxlQUFlO1FBQ3pDLElBQUksUUFBUSxDQUFDO1FBRWIsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ1osTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUM1QixDQUFDO1FBRUQscUNBQXFDO1FBQ3JDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckIsUUFBUSxHQUFHLFVBQUMsSUFBSSxJQUFLLE9BQUEsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQXBFLENBQW9FLENBQUM7UUFDNUYsQ0FBQztRQUNELElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzNCLFFBQVEsR0FBRyxNQUFNLENBQUM7UUFDckIsQ0FBQztRQUNELElBQUksQ0FBQyxDQUFDO1lBQ0osT0FBTyxDQUFDLEtBQUssQ0FBQyxvQ0FBb0MsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUM1RCxPQUFPLENBQUMsS0FBSyxDQUFDLHVDQUF1QyxDQUFDLENBQUM7WUFDdkQsTUFBTSxDQUFDO1FBQ1QsQ0FBQztRQUVELElBQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQztRQUNmLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQUMsSUFBSSxJQUFLLE9BQUEsS0FBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMsRUFBL0MsQ0FBK0MsQ0FBQyxDQUFDO1FBQzlFLElBQUksQ0FBQyxhQUFhLEdBQUcsR0FBRyxDQUFDO1FBQ3pCLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxTQUFTLEVBQUUsV0FBVyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7SUFDMUQsQ0FBQztJQUVPLCtCQUFXLEdBQVg7UUFDTixJQUFJLENBQUMsYUFBYSxHQUFHLEVBQUUsQ0FBQztRQUN4QixJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsU0FBUyxFQUFFLFdBQVcsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFFTyw0QkFBUSxHQUFSLFVBQVMsSUFBSSxFQUFFLEVBQUU7UUFDdkIsSUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFDMUMsSUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUUvQixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRyxFQUFFLENBQUMsQ0FBQztZQUFDLE1BQU0sQ0FBQztRQUVyRCxJQUFNLFlBQVksR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRXJELHdEQUF3RDtRQUN4RCxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwQyxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDckMsQ0FBQztRQUNELElBQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRWxELElBQU0sWUFBWSxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTFELHVEQUF1RDtRQUN2RCxJQUFJLE9BQU8sR0FBRyxDQUFDLFVBQVUsS0FBSyxFQUFFLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDO1FBRTNGLFVBQVUsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUU1QyxVQUFVLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQzlCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUyxLQUFLLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ2pELEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQy9CLENBQUM7UUFFRCxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsU0FBUyxFQUFFLFdBQVcsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztJQUMxSCxDQUFDO0lBRU8sNEJBQVEsR0FBUixVQUFTLElBQUksRUFBRSxFQUFFO1FBQ3ZCLElBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBRTFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFHLEVBQUUsQ0FBQyxDQUFDO1lBQUMsTUFBTSxDQUFDO1FBRXJELHdEQUF3RDtRQUN4RCxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwQyxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDckMsQ0FBQztRQUNELElBQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRWxELElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRWpELFVBQVUsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFFekMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUN4QixFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLFNBQVMsS0FBSyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUMzQyxFQUFFLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUMvQixDQUFDO1FBRUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxXQUFXLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3ZILENBQUM7SUFFRCw0QkFBUSxHQUFSO1FBQ0UsTUFBTSxDQUFDO1lBQ0wsZUFBZSxFQUFFLElBQUksQ0FBQyxlQUFlO1lBQ3JDLGFBQWEsRUFBRSxJQUFJLENBQUMsYUFBYTtZQUNqQyxhQUFhLEVBQUUsSUFBSSxDQUFDLGFBQWE7WUFDakMsYUFBYSxFQUFFLElBQUksQ0FBQyxhQUFhO1NBQ2xDLENBQUM7SUFDSixDQUFDO0lBRU8sNEJBQVEsR0FBUixVQUFTLEtBQUs7UUFDcEIsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7WUFBQyxNQUFNLENBQUM7UUFFbkIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUU7WUFDbEIsZUFBZSxFQUFFLEtBQUssQ0FBQyxlQUFlLElBQUksRUFBRTtZQUM1QyxhQUFhLEVBQUUsS0FBSyxDQUFDLGFBQWEsSUFBSSxFQUFFO1lBQ3hDLGFBQWEsRUFBRSxLQUFLLENBQUMsYUFBYSxJQUFJLEVBQUU7WUFDeEMsYUFBYSxFQUFFLEtBQUssQ0FBQyxhQUFhO1NBQ25DLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxvQ0FBZ0IsR0FBaEIsVUFBaUIsRUFBRTtRQUFuQixpQkFFQztRQURDLE9BQU8sQ0FBQyxjQUFNLE9BQUEsRUFBRSxDQUFDLEtBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFuQixDQUFtQixDQUFDLENBQUM7SUFDckMsQ0FBQztJQUVELGtCQUFrQjtJQUNWLGdDQUFZLEdBQXBCLFVBQXFCLElBQUksRUFBRSxTQUFTLEVBQUUsRUFBRTtRQUN0QyxhQUFhO1FBQ2IsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxFQUFFLENBQUMsTUFBTSxJQUFJLFNBQVMsS0FBSyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUN4RCxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQ2YsQ0FBQztRQUVELE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFHTywrQkFBVyxHQUFuQixVQUFvQixHQUFHLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxRQUFRO1FBQWpELGlCQXNCQztRQXJCQyw0Q0FBNEM7UUFDNUMsSUFBSSxTQUFTLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRS9CLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ2xCLHlFQUF5RTtZQUN6RSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxVQUFDLEtBQUs7Z0JBQzFCLEVBQUUsQ0FBQyxDQUFDLEtBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNyRCxTQUFTLEdBQUcsSUFBSSxDQUFDO2dCQUNuQixDQUFDO1lBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBRUQsc0JBQXNCO1FBQ3RCLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUNmLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ3RCLENBQUM7UUFDRCxrRUFBa0U7UUFDbEUsRUFBRSxDQUFDLENBQUMsUUFBUSxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDMUIsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ3ZCLENBQUM7UUFDRCxNQUFNLENBQUMsU0FBUyxDQUFDO0lBQ25CLENBQUM7SUFFTywyQ0FBdUIsR0FBL0IsVUFBZ0MsU0FBZ0I7UUFBaEQsaUJBU0M7UUFUK0IsMEJBQUEsRUFBQSxnQkFBZ0I7UUFDOUMsU0FBUyxHQUFHLFNBQVMsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDO1FBRTFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDakQsSUFBSSxDQUFDLGVBQWUsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsZUFBZSxZQUFHLEdBQUMsU0FBUyxDQUFDLEVBQUUsSUFBRyxJQUFJLE1BQUUsQ0FBQztRQUN6RixDQUFDO1FBQ0QsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDdkIsU0FBUyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsVUFBQyxLQUFLLElBQUssT0FBQSxLQUFJLENBQUMsdUJBQXVCLENBQUMsS0FBSyxDQUFDLEVBQW5DLENBQW1DLENBQUMsQ0FBQztRQUM3RSxDQUFDOztJQUNILENBQUM7SUFFTyx3Q0FBb0IsR0FBNUIsVUFBNkIsSUFBSSxFQUFFLEtBQUs7UUFBeEMsaUJBY0M7UUFiQyw4QkFBOEI7UUFDOUIsSUFBSSxDQUFDLFdBQVc7YUFDYixNQUFNLENBQUMsVUFBQyxVQUFVLElBQUssT0FBQSxVQUFVLEtBQUssSUFBSSxFQUFuQixDQUFtQixDQUFDO2FBQzNDLE9BQU8sQ0FBQyxVQUFDLFVBQVU7WUFDbEIsS0FBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxXQUFXLENBQUMsVUFBVSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDO1FBQzFFLENBQUMsQ0FBQyxDQUFDO1FBRUwsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNWLElBQUksQ0FBQyxhQUFhLGFBQUksR0FBQyxJQUFJLENBQUMsRUFBRSxJQUFHLElBQUksS0FBQyxDQUFDO1FBQ3pDLENBQUM7UUFDRCxJQUFJLENBQUMsQ0FBQztZQUNKLElBQUksQ0FBQyxhQUFhLEdBQUcsRUFBRSxDQUFDO1FBQzFCLENBQUM7O0lBQ0gsQ0FBQztJQUVPLHVDQUFtQixHQUEzQixVQUE0QixJQUFJLEVBQUUsS0FBSztRQUNyQyxJQUFJLENBQUMsYUFBYSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxhQUFhLFlBQUcsR0FBQyxJQUFJLENBQUMsRUFBRSxJQUFHLEtBQUssTUFBRSxDQUFDOztJQUNqRixDQUFDO0lBOWJNLHFCQUFXLEdBQUcsSUFBSSxDQUFDO0lBZ2NyQixvQkFBVSxHQUEwQjtRQUMzQyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUU7S0FDbkIsQ0FBQztJQUNGLGtCQUFrQjtJQUNYLHdCQUFjLEdBQW1FLGNBQU0sT0FBQSxFQUM3RixFQUQ2RixDQUM3RixDQUFDO0lBOWJZO1FBQVgsVUFBVTs7NENBQW1CO0lBQ2xCO1FBQVgsVUFBVTs7c0RBQXdDO0lBQ3ZDO1FBQVgsVUFBVTs7b0RBQXNDO0lBQ3JDO1FBQVgsVUFBVTs7b0RBQXNDO0lBQ3JDO1FBQVgsVUFBVTs7b0RBQThCO0lBQzdCO1FBQVgsVUFBVTtrQ0FBYyxRQUFRO2tEQUFDO0lBdUR4QjtRQUFULFFBQVE7OztnREFFUjtJQUVTO1FBQVQsUUFBUTs7O2tEQU1SO0lBRVM7UUFBVCxRQUFROzs7Z0RBTVI7SUF1RE87UUFBUCxNQUFNOzs7OzRDQVlOO0lBRU87UUFBUCxNQUFNOzs7OzJDQXFCTjtJQUdPO1FBQVAsTUFBTTs7OzttREFFTjtJQUVPO1FBQVAsTUFBTTs7Ozs2Q0FFTjtJQUVPO1FBQVAsTUFBTTs7Ozs2Q0FFTjtJQUVPO1FBQVAsTUFBTTs7OztrREFJTjtJQUVPO1FBQVAsTUFBTTs7OztzREFJTjtJQUVPO1FBQVAsTUFBTTs7OzttREFTTjtJQUVPO1FBQVAsTUFBTTs7OztpREFVTjtJQUVPO1FBQVAsTUFBTTs7OztrREFjTjtJQUVPO1FBQVAsTUFBTTs7OztvREFHTjtJQUVPO1FBQVAsTUFBTTs7Ozs4Q0FFTjtJQUVPO1FBQVAsTUFBTTs7OztnREFFTjtJQUVPO1FBQVAsTUFBTTs7OztnREFFTjtJQUVPO1FBQVAsTUFBTTs7OztxREFJTjtJQWFPO1FBQVAsTUFBTTs7OztnREF3Qk47SUFFTztRQUFQLE1BQU07Ozs7Z0RBR047SUFFTztRQUFQLE1BQU07Ozs7NkNBMkJOO0lBRU87UUFBUCxNQUFNOzs7OzZDQXFCTjtJQVdPO1FBQVAsTUFBTTs7Ozs2Q0FTTjtJQThFSCxnQkFBQztDQXZjRCxBQXVjQyxJQUFBO1NBdmNZLFNBQVMiLCJmaWxlIjoidHJlZS5tb2RlbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlLCBFdmVudEVtaXR0ZXIgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgb2JzZXJ2YWJsZSwgY29tcHV0ZWQsIGFjdGlvbiwgYXV0b3J1biB9IGZyb20gJ21vYngnO1xyXG5pbXBvcnQgeyBUcmVlTm9kZSB9IGZyb20gJy4vdHJlZS1ub2RlLm1vZGVsJztcclxuaW1wb3J0IHsgVHJlZU9wdGlvbnMgfSBmcm9tICcuL3RyZWUtb3B0aW9ucy5tb2RlbCc7XHJcbmltcG9ydCB7IFRyZWVWaXJ0dWFsU2Nyb2xsIH0gZnJvbSAnLi90cmVlLXZpcnR1YWwtc2Nyb2xsLm1vZGVsJztcclxuaW1wb3J0IHsgSVRyZWVNb2RlbCwgSURUeXBlLCBJRFR5cGVEaWN0aW9uYXJ5IH0gZnJvbSAnLi4vZGVmcy9hcGknO1xyXG5pbXBvcnQgeyBUUkVFX0VWRU5UUyB9IGZyb20gJy4uL2NvbnN0YW50cy9ldmVudHMnO1xyXG5cclxuaW1wb3J0ICogYXMgXyBmcm9tICdsb2Rhc2gnO1xyXG5cclxuY29uc3QgeyBmaXJzdCwgbGFzdCwgY29tcGFjdCwgZmluZCwgaW5jbHVkZXMsIGlzU3RyaW5nLCBpc0Z1bmN0aW9uIH0gPSBfO1xyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBUcmVlTW9kZWwgaW1wbGVtZW50cyBJVHJlZU1vZGVsIHtcclxuICBzdGF0aWMgZm9jdXNlZFRyZWUgPSBudWxsO1xyXG5cclxuICBvcHRpb25zOiBUcmVlT3B0aW9ucyA9IG5ldyBUcmVlT3B0aW9ucygpO1xyXG4gIG5vZGVzOiBhbnlbXTtcclxuICBldmVudE5hbWVzID0gT2JqZWN0LmtleXMoVFJFRV9FVkVOVFMpO1xyXG4gIHZpcnR1YWxTY3JvbGw6IFRyZWVWaXJ0dWFsU2Nyb2xsO1xyXG5cclxuICBAb2JzZXJ2YWJsZSByb290czogVHJlZU5vZGVbXTtcclxuICBAb2JzZXJ2YWJsZSBleHBhbmRlZE5vZGVJZHM6IElEVHlwZURpY3Rpb25hcnkgPSB7fTtcclxuICBAb2JzZXJ2YWJsZSBhY3RpdmVOb2RlSWRzOiBJRFR5cGVEaWN0aW9uYXJ5ID0ge307XHJcbiAgQG9ic2VydmFibGUgaGlkZGVuTm9kZUlkczogSURUeXBlRGljdGlvbmFyeSA9IHt9O1xyXG4gIEBvYnNlcnZhYmxlIGZvY3VzZWROb2RlSWQ6IElEVHlwZSA9IG51bGw7XHJcbiAgQG9ic2VydmFibGUgdmlydHVhbFJvb3Q6IFRyZWVOb2RlO1xyXG5cclxuICBwcml2YXRlIGZpcnN0VXBkYXRlID0gdHJ1ZTtcclxuICBwcml2YXRlIGV2ZW50czogYW55O1xyXG5cclxuICAvLyBldmVudHNcclxuICBmaXJlRXZlbnQoZXZlbnQpIHtcclxuICAgIGV2ZW50LnRyZWVNb2RlbCA9IHRoaXM7XHJcbiAgICB0aGlzLmV2ZW50c1tldmVudC5ldmVudE5hbWVdLmVtaXQoZXZlbnQpO1xyXG4gICAgdGhpcy5ldmVudHMuZXZlbnQuZW1pdChldmVudCk7XHJcbiAgfVxyXG5cclxuICBzdWJzY3JpYmUoZXZlbnROYW1lLCBmbikge1xyXG4gICAgdGhpcy5ldmVudHNbZXZlbnROYW1lXS5zdWJzY3JpYmUoZm4pO1xyXG4gIH1cclxuXHJcblxyXG4gIC8vIGdldHRlcnNcclxuICBnZXRGb2N1c2VkTm9kZSgpOiBUcmVlTm9kZSB7XHJcbiAgICByZXR1cm4gdGhpcy5mb2N1c2VkTm9kZTtcclxuICB9XHJcblxyXG5cclxuICBnZXRBY3RpdmVOb2RlKCk6IFRyZWVOb2RlIHtcclxuICAgIHJldHVybiB0aGlzLmFjdGl2ZU5vZGVzWzBdO1xyXG4gIH1cclxuXHJcbiAgZ2V0QWN0aXZlTm9kZXMoKTogVHJlZU5vZGVbXSB7XHJcbiAgICByZXR1cm4gdGhpcy5hY3RpdmVOb2RlcztcclxuICB9XHJcblxyXG4gIGdldFZpc2libGVSb290cygpIHtcclxuICAgIHJldHVybiB0aGlzLnZpcnR1YWxSb290LnZpc2libGVDaGlsZHJlbjtcclxuICB9XHJcblxyXG4gIGdldEZpcnN0Um9vdChza2lwSGlkZGVuID0gZmFsc2UpIHtcclxuICAgIHJldHVybiBmaXJzdChza2lwSGlkZGVuID8gdGhpcy5nZXRWaXNpYmxlUm9vdHMoKSA6IHRoaXMucm9vdHMpO1xyXG4gIH1cclxuXHJcbiAgZ2V0TGFzdFJvb3Qoc2tpcEhpZGRlbiA9IGZhbHNlKSB7XHJcbiAgICByZXR1cm4gbGFzdChza2lwSGlkZGVuID8gdGhpcy5nZXRWaXNpYmxlUm9vdHMoKSA6IHRoaXMucm9vdHMpO1xyXG4gIH1cclxuXHJcbiAgZ2V0IGlzRm9jdXNlZCgpIHtcclxuICAgIHJldHVybiBUcmVlTW9kZWwuZm9jdXNlZFRyZWUgPT09IHRoaXM7XHJcbiAgfVxyXG5cclxuICBpc05vZGVGb2N1c2VkKG5vZGUpIHtcclxuICAgIHJldHVybiB0aGlzLmZvY3VzZWROb2RlID09PSBub2RlO1xyXG4gIH1cclxuXHJcbiAgaXNFbXB0eVRyZWUoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5yb290cyAmJiB0aGlzLnJvb3RzLmxlbmd0aCA9PT0gMDtcclxuICB9XHJcblxyXG4gIEBjb21wdXRlZCBnZXQgZm9jdXNlZE5vZGUoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5mb2N1c2VkTm9kZUlkID8gdGhpcy5nZXROb2RlQnlJZCh0aGlzLmZvY3VzZWROb2RlSWQpIDogbnVsbDtcclxuICB9XHJcblxyXG4gIEBjb21wdXRlZCBnZXQgZXhwYW5kZWROb2RlcygpIHtcclxuICAgIGNvbnN0IG5vZGVzID0gT2JqZWN0LmtleXModGhpcy5leHBhbmRlZE5vZGVJZHMpXHJcbiAgICAgIC5maWx0ZXIoKGlkKSA9PiB0aGlzLmV4cGFuZGVkTm9kZUlkc1tpZF0pXHJcbiAgICAgIC5tYXAoKGlkKSA9PiB0aGlzLmdldE5vZGVCeUlkKGlkKSk7XHJcblxyXG4gICAgcmV0dXJuIGNvbXBhY3Qobm9kZXMpO1xyXG4gIH1cclxuXHJcbiAgQGNvbXB1dGVkIGdldCBhY3RpdmVOb2RlcygpIHtcclxuICAgIGNvbnN0IG5vZGVzID0gT2JqZWN0LmtleXModGhpcy5hY3RpdmVOb2RlSWRzKVxyXG4gICAgICAuZmlsdGVyKChpZCkgPT4gdGhpcy5hY3RpdmVOb2RlSWRzW2lkXSlcclxuICAgICAgLm1hcCgoaWQpID0+IHRoaXMuZ2V0Tm9kZUJ5SWQoaWQpKTtcclxuXHJcbiAgICByZXR1cm4gY29tcGFjdChub2Rlcyk7XHJcbiAgfVxyXG5cclxuICAvLyBsb2NhdGluZyBub2Rlc1xyXG4gIGdldE5vZGVCeVBhdGgocGF0aDogYW55W10sIHN0YXJ0Tm9kZT0gbnVsbCk6IFRyZWVOb2RlIHtcclxuICAgIGlmICghcGF0aCkgcmV0dXJuIG51bGw7XHJcblxyXG4gICAgc3RhcnROb2RlID0gc3RhcnROb2RlIHx8IHRoaXMudmlydHVhbFJvb3Q7XHJcbiAgICBpZiAocGF0aC5sZW5ndGggPT09IDApIHJldHVybiBzdGFydE5vZGU7XHJcblxyXG4gICAgaWYgKCFzdGFydE5vZGUuY2hpbGRyZW4pIHJldHVybiBudWxsO1xyXG5cclxuICAgIGNvbnN0IGNoaWxkSWQgPSBwYXRoLnNoaWZ0KCk7XHJcbiAgICBjb25zdCBjaGlsZE5vZGUgPSBmaW5kKHN0YXJ0Tm9kZS5jaGlsZHJlbiwgeyBpZDogY2hpbGRJZCB9KTtcclxuXHJcbiAgICBpZiAoIWNoaWxkTm9kZSkgcmV0dXJuIG51bGw7XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuZ2V0Tm9kZUJ5UGF0aChwYXRoLCBjaGlsZE5vZGUpO1xyXG4gIH1cclxuXHJcbiAgZ2V0Tm9kZUJ5SWQoaWQpIHtcclxuICAgIGNvbnN0IGlkU3RyID0gaWQudG9TdHJpbmcoKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcy5nZXROb2RlQnkoKG5vZGUpID0+IG5vZGUuaWQudG9TdHJpbmcoKSA9PT0gaWRTdHIpO1xyXG4gIH1cclxuXHJcbiAgZ2V0Tm9kZUJ5KHByZWRpY2F0ZSwgc3RhcnROb2RlID0gbnVsbCkge1xyXG4gICAgc3RhcnROb2RlID0gc3RhcnROb2RlIHx8IHRoaXMudmlydHVhbFJvb3Q7XHJcblxyXG4gICAgaWYgKCFzdGFydE5vZGUuY2hpbGRyZW4pIHJldHVybiBudWxsO1xyXG5cclxuICAgIGNvbnN0IGZvdW5kID0gZmluZChzdGFydE5vZGUuY2hpbGRyZW4sIHByZWRpY2F0ZSk7XHJcblxyXG4gICAgaWYgKGZvdW5kKSB7IC8vIGZvdW5kIGluIGNoaWxkcmVuXHJcbiAgICAgIHJldHVybiBmb3VuZDtcclxuICAgIH0gZWxzZSB7IC8vIGxvb2sgaW4gY2hpbGRyZW4ncyBjaGlsZHJlblxyXG4gICAgICBmb3IgKGxldCBjaGlsZCBvZiBzdGFydE5vZGUuY2hpbGRyZW4pIHtcclxuICAgICAgICBjb25zdCBmb3VuZEluQ2hpbGRyZW4gPSB0aGlzLmdldE5vZGVCeShwcmVkaWNhdGUsIGNoaWxkKTtcclxuICAgICAgICBpZiAoZm91bmRJbkNoaWxkcmVuKSByZXR1cm4gZm91bmRJbkNoaWxkcmVuO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBpc0V4cGFuZGVkKG5vZGUpIHtcclxuICAgIHJldHVybiB0aGlzLmV4cGFuZGVkTm9kZUlkc1tub2RlLmlkXTtcclxuICB9XHJcblxyXG4gIGlzSGlkZGVuKG5vZGUpIHtcclxuICAgIHJldHVybiB0aGlzLmhpZGRlbk5vZGVJZHNbbm9kZS5pZF07XHJcbiAgfVxyXG5cclxuICBpc0FjdGl2ZShub2RlKSB7XHJcbiAgICByZXR1cm4gdGhpcy5hY3RpdmVOb2RlSWRzW25vZGUuaWRdO1xyXG4gIH1cclxuXHJcbiAgLy8gYWN0aW9uc1xyXG4gIEBhY3Rpb24gc2V0RGF0YSh7IG5vZGVzLCBvcHRpb25zID0gbnVsbCwgZXZlbnRzID0gbnVsbCB9OiB7bm9kZXM6IGFueSwgb3B0aW9uczogYW55LCBldmVudHM6IGFueX0pIHtcclxuICAgIGlmIChvcHRpb25zKSB7XHJcbiAgICAgIHRoaXMub3B0aW9ucyA9IG5ldyBUcmVlT3B0aW9ucyhvcHRpb25zKTtcclxuICAgIH1cclxuICAgIGlmIChldmVudHMpIHtcclxuICAgICAgdGhpcy5ldmVudHMgPSBldmVudHM7XHJcbiAgICB9XHJcbiAgICBpZiAobm9kZXMpIHtcclxuICAgICAgdGhpcy5ub2RlcyA9IG5vZGVzO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgfVxyXG5cclxuICBAYWN0aW9uIHVwZGF0ZSgpIHtcclxuICAgIC8vIFJlYnVpbGQgdHJlZTpcclxuICAgIGxldCB2aXJ0dWFsUm9vdENvbmZpZyA9IHtcclxuICAgICAgaWQ6IHRoaXMub3B0aW9ucy5yb290SWQsXHJcbiAgICAgIHZpcnR1YWw6IHRydWUsXHJcbiAgICAgIFt0aGlzLm9wdGlvbnMuY2hpbGRyZW5GaWVsZF06IHRoaXMubm9kZXNcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy52aXJ0dWFsUm9vdCA9IG5ldyBUcmVlTm9kZSh2aXJ0dWFsUm9vdENvbmZpZywgbnVsbCwgdGhpcywgMCk7XHJcblxyXG4gICAgdGhpcy5yb290cyA9IHRoaXMudmlydHVhbFJvb3QuY2hpbGRyZW47XHJcblxyXG4gICAgLy8gRmlyZSBldmVudDpcclxuICAgIGlmICh0aGlzLmZpcnN0VXBkYXRlKSB7XHJcbiAgICAgIGlmICh0aGlzLnJvb3RzKSB7XHJcbiAgICAgICAgdGhpcy5maXJzdFVwZGF0ZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuX2NhbGN1bGF0ZUV4cGFuZGVkTm9kZXMoKTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5maXJlRXZlbnQoeyBldmVudE5hbWU6IFRSRUVfRVZFTlRTLnVwZGF0ZURhdGEgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuXHJcbiAgQGFjdGlvbiBzZXRGb2N1c2VkTm9kZShub2RlKSB7XHJcbiAgICB0aGlzLmZvY3VzZWROb2RlSWQgPSBub2RlID8gbm9kZS5pZCA6IG51bGw7XHJcbiAgfVxyXG5cclxuICBAYWN0aW9uIHNldEZvY3VzKHZhbHVlKSB7XHJcbiAgICBUcmVlTW9kZWwuZm9jdXNlZFRyZWUgPSB2YWx1ZSA/IHRoaXMgOiBudWxsO1xyXG4gIH1cclxuXHJcbiAgQGFjdGlvbiBkb0ZvckFsbChmbikge1xyXG4gICAgdGhpcy5yb290cy5mb3JFYWNoKChyb290KSA9PiByb290LmRvRm9yQWxsKGZuKSk7XHJcbiAgfVxyXG5cclxuICBAYWN0aW9uIGZvY3VzTmV4dE5vZGUoKSB7XHJcbiAgICBsZXQgcHJldmlvdXNOb2RlID0gdGhpcy5nZXRGb2N1c2VkTm9kZSgpO1xyXG4gICAgbGV0IG5leHROb2RlID0gcHJldmlvdXNOb2RlID8gcHJldmlvdXNOb2RlLmZpbmROZXh0Tm9kZSh0cnVlLCB0cnVlKSA6IHRoaXMuZ2V0Rmlyc3RSb290KHRydWUpO1xyXG4gICAgaWYgKG5leHROb2RlKSBuZXh0Tm9kZS5mb2N1cygpO1xyXG4gIH1cclxuXHJcbiAgQGFjdGlvbiBmb2N1c1ByZXZpb3VzTm9kZSgpIHtcclxuICAgIGxldCBwcmV2aW91c05vZGUgPSB0aGlzLmdldEZvY3VzZWROb2RlKCk7XHJcbiAgICBsZXQgbmV4dE5vZGUgPSBwcmV2aW91c05vZGUgPyBwcmV2aW91c05vZGUuZmluZFByZXZpb3VzTm9kZSh0cnVlKSA6IHRoaXMuZ2V0TGFzdFJvb3QodHJ1ZSk7XHJcbiAgICBpZiAobmV4dE5vZGUpIG5leHROb2RlLmZvY3VzKCk7XHJcbiAgfVxyXG5cclxuICBAYWN0aW9uIGZvY3VzRHJpbGxEb3duKCkge1xyXG4gICAgbGV0IHByZXZpb3VzTm9kZSA9IHRoaXMuZ2V0Rm9jdXNlZE5vZGUoKTtcclxuICAgIGlmIChwcmV2aW91c05vZGUgJiYgcHJldmlvdXNOb2RlLmlzQ29sbGFwc2VkICYmIHByZXZpb3VzTm9kZS5oYXNDaGlsZHJlbikge1xyXG4gICAgICBwcmV2aW91c05vZGUudG9nZ2xlRXhwYW5kZWQoKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBsZXQgbmV4dE5vZGUgPSBwcmV2aW91c05vZGUgPyBwcmV2aW91c05vZGUuZ2V0Rmlyc3RDaGlsZCh0cnVlKSA6IHRoaXMuZ2V0Rmlyc3RSb290KHRydWUpO1xyXG4gICAgICBpZiAobmV4dE5vZGUpIG5leHROb2RlLmZvY3VzKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBAYWN0aW9uIGZvY3VzRHJpbGxVcCgpIHtcclxuICAgIGxldCBwcmV2aW91c05vZGUgPSB0aGlzLmdldEZvY3VzZWROb2RlKCk7XHJcbiAgICBpZiAoIXByZXZpb3VzTm9kZSkgcmV0dXJuO1xyXG4gICAgaWYgKHByZXZpb3VzTm9kZS5pc0V4cGFuZGVkKSB7XHJcbiAgICAgIHByZXZpb3VzTm9kZS50b2dnbGVFeHBhbmRlZCgpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGxldCBuZXh0Tm9kZSA9IHByZXZpb3VzTm9kZS5yZWFsUGFyZW50O1xyXG4gICAgICBpZiAobmV4dE5vZGUpIG5leHROb2RlLmZvY3VzKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBAYWN0aW9uIHNldEFjdGl2ZU5vZGUobm9kZSwgdmFsdWUsIG11bHRpID0gZmFsc2UpIHtcclxuICAgIGlmIChtdWx0aSkge1xyXG4gICAgICB0aGlzLl9zZXRBY3RpdmVOb2RlTXVsdGkobm9kZSwgdmFsdWUpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHRoaXMuX3NldEFjdGl2ZU5vZGVTaW5nbGUobm9kZSwgdmFsdWUpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh2YWx1ZSkge1xyXG4gICAgICBub2RlLmZvY3VzKCk7XHJcbiAgICAgIHRoaXMuZmlyZUV2ZW50KHsgZXZlbnROYW1lOiBUUkVFX0VWRU5UUy5hY3RpdmF0ZSwgbm9kZSB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuZmlyZUV2ZW50KHsgZXZlbnROYW1lOiBUUkVFX0VWRU5UUy5kZWFjdGl2YXRlLCBub2RlIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgQGFjdGlvbiBzZXRFeHBhbmRlZE5vZGUobm9kZSwgdmFsdWUpIHtcclxuICAgIHRoaXMuZXhwYW5kZWROb2RlSWRzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5leHBhbmRlZE5vZGVJZHMsIHtbbm9kZS5pZF06IHZhbHVlfSk7XHJcbiAgICB0aGlzLmZpcmVFdmVudCh7IGV2ZW50TmFtZTogVFJFRV9FVkVOVFMudG9nZ2xlRXhwYW5kZWQsIG5vZGUsIGlzRXhwYW5kZWQ6IHZhbHVlIH0pO1xyXG4gIH1cclxuXHJcbiAgQGFjdGlvbiBleHBhbmRBbGwoKSB7XHJcbiAgICB0aGlzLnJvb3RzLmZvckVhY2goKHJvb3QpID0+IHJvb3QuZXhwYW5kQWxsKCkpO1xyXG4gIH1cclxuXHJcbiAgQGFjdGlvbiBjb2xsYXBzZUFsbCgpIHtcclxuICAgIHRoaXMucm9vdHMuZm9yRWFjaCgocm9vdCkgPT4gcm9vdC5jb2xsYXBzZUFsbCgpKTtcclxuICB9XHJcblxyXG4gIEBhY3Rpb24gc2V0SXNIaWRkZW4obm9kZSwgdmFsdWUpIHtcclxuICAgIHRoaXMuaGlkZGVuTm9kZUlkcyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuaGlkZGVuTm9kZUlkcywge1tub2RlLmlkXTogdmFsdWV9KTtcclxuICB9XHJcblxyXG4gIEBhY3Rpb24gc2V0SGlkZGVuTm9kZUlkcyhub2RlSWRzKSB7XHJcbiAgICB0aGlzLmhpZGRlbk5vZGVJZHMgPSBub2RlSWRzLnJlZHVjZSgoaWQsIGhpZGRlbk5vZGVJZHMpID0+IE9iamVjdC5hc3NpZ24oaGlkZGVuTm9kZUlkcywge1xyXG4gICAgICBbaWRdOiB0cnVlXHJcbiAgICB9KSwge30pO1xyXG4gIH1cclxuXHJcbiAgcGVyZm9ybUtleUFjdGlvbihub2RlLCAkZXZlbnQpIHtcclxuICAgIGNvbnN0IGFjdGlvbiA9IHRoaXMub3B0aW9ucy5hY3Rpb25NYXBwaW5nLmtleXNbJGV2ZW50LmtleUNvZGVdO1xyXG4gICAgaWYgKGFjdGlvbikge1xyXG4gICAgICAkZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgYWN0aW9uKHRoaXMsIG5vZGUsICRldmVudCk7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgQGFjdGlvbiBmaWx0ZXJOb2RlcyhmaWx0ZXIsIGF1dG9TaG93ID0gdHJ1ZSkge1xyXG4gICAgbGV0IGZpbHRlckZuO1xyXG5cclxuICAgIGlmICghZmlsdGVyKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmNsZWFyRmlsdGVyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gc3VwcG9ydCBmdW5jdGlvbiBhbmQgc3RyaW5nIGZpbHRlclxyXG4gICAgaWYgKGlzU3RyaW5nKGZpbHRlcikpIHtcclxuICAgICAgZmlsdGVyRm4gPSAobm9kZSkgPT4gbm9kZS5kaXNwbGF5RmllbGQudG9Mb3dlckNhc2UoKS5pbmRleE9mKGZpbHRlci50b0xvd2VyQ2FzZSgpKSAhPT0gLTE7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChpc0Z1bmN0aW9uKGZpbHRlcikpIHtcclxuICAgICAgIGZpbHRlckZuID0gZmlsdGVyO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0RvblxcJ3Qga25vdyB3aGF0IHRvIGRvIHdpdGggZmlsdGVyJywgZmlsdGVyKTtcclxuICAgICAgY29uc29sZS5lcnJvcignU2hvdWxkIGJlIGVpdGhlciBhIHN0cmluZyBvciBmdW5jdGlvbicpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgaWRzID0ge307XHJcbiAgICB0aGlzLnJvb3RzLmZvckVhY2goKG5vZGUpID0+IHRoaXMuX2ZpbHRlck5vZGUoaWRzLCBub2RlLCBmaWx0ZXJGbiwgYXV0b1Nob3cpKTtcclxuICAgIHRoaXMuaGlkZGVuTm9kZUlkcyA9IGlkcztcclxuICAgIHRoaXMuZmlyZUV2ZW50KHsgZXZlbnROYW1lOiBUUkVFX0VWRU5UUy5jaGFuZ2VGaWx0ZXIgfSk7XHJcbiAgfVxyXG5cclxuICBAYWN0aW9uIGNsZWFyRmlsdGVyKCkge1xyXG4gICAgdGhpcy5oaWRkZW5Ob2RlSWRzID0ge307XHJcbiAgICB0aGlzLmZpcmVFdmVudCh7IGV2ZW50TmFtZTogVFJFRV9FVkVOVFMuY2hhbmdlRmlsdGVyIH0pO1xyXG4gIH1cclxuXHJcbiAgQGFjdGlvbiBtb3ZlTm9kZShub2RlLCB0bykge1xyXG4gICAgY29uc3QgZnJvbUluZGV4ID0gbm9kZS5nZXRJbmRleEluUGFyZW50KCk7XHJcbiAgICBjb25zdCBmcm9tUGFyZW50ID0gbm9kZS5wYXJlbnQ7XHJcblxyXG4gICAgaWYgKCF0aGlzLl9jYW5Nb3ZlTm9kZShub2RlLCBmcm9tSW5kZXggLCB0bykpIHJldHVybjtcclxuXHJcbiAgICBjb25zdCBmcm9tQ2hpbGRyZW4gPSBmcm9tUGFyZW50LmdldEZpZWxkKCdjaGlsZHJlbicpO1xyXG5cclxuICAgIC8vIElmIG5vZGUgZG9lc24ndCBoYXZlIGNoaWxkcmVuIC0gY3JlYXRlIGNoaWxkcmVuIGFycmF5XHJcbiAgICBpZiAoIXRvLnBhcmVudC5nZXRGaWVsZCgnY2hpbGRyZW4nKSkge1xyXG4gICAgICB0by5wYXJlbnQuc2V0RmllbGQoJ2NoaWxkcmVuJywgW10pO1xyXG4gICAgfVxyXG4gICAgY29uc3QgdG9DaGlsZHJlbiA9IHRvLnBhcmVudC5nZXRGaWVsZCgnY2hpbGRyZW4nKTtcclxuXHJcbiAgICBjb25zdCBvcmlnaW5hbE5vZGUgPSBmcm9tQ2hpbGRyZW4uc3BsaWNlKGZyb21JbmRleCwgMSlbMF07XHJcblxyXG4gICAgLy8gQ29tcGVuc2F0ZSBmb3IgaW5kZXggaWYgYWxyZWFkeSByZW1vdmVkIGZyb20gcGFyZW50OlxyXG4gICAgbGV0IHRvSW5kZXggPSAoZnJvbVBhcmVudCA9PT0gdG8ucGFyZW50ICYmIHRvLmluZGV4ID4gZnJvbUluZGV4KSA/IHRvLmluZGV4IC0gMSA6IHRvLmluZGV4O1xyXG5cclxuICAgIHRvQ2hpbGRyZW4uc3BsaWNlKHRvSW5kZXgsIDAsIG9yaWdpbmFsTm9kZSk7XHJcblxyXG4gICAgZnJvbVBhcmVudC50cmVlTW9kZWwudXBkYXRlKCk7XHJcbiAgICBpZiAodG8ucGFyZW50LnRyZWVNb2RlbCAhPT0gZnJvbVBhcmVudC50cmVlTW9kZWwpIHtcclxuICAgICAgdG8ucGFyZW50LnRyZWVNb2RlbC51cGRhdGUoKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmZpcmVFdmVudCh7IGV2ZW50TmFtZTogVFJFRV9FVkVOVFMubW92ZU5vZGUsIG5vZGU6IG9yaWdpbmFsTm9kZSwgdG86IHsgcGFyZW50OiB0by5wYXJlbnQuZGF0YSwgaW5kZXg6IHRvSW5kZXggfSB9KTtcclxuICB9XHJcblxyXG4gIEBhY3Rpb24gY29weU5vZGUobm9kZSwgdG8pIHtcclxuICAgIGNvbnN0IGZyb21JbmRleCA9IG5vZGUuZ2V0SW5kZXhJblBhcmVudCgpO1xyXG5cclxuICAgIGlmICghdGhpcy5fY2FuTW92ZU5vZGUobm9kZSwgZnJvbUluZGV4ICwgdG8pKSByZXR1cm47XHJcblxyXG4gICAgLy8gSWYgbm9kZSBkb2Vzbid0IGhhdmUgY2hpbGRyZW4gLSBjcmVhdGUgY2hpbGRyZW4gYXJyYXlcclxuICAgIGlmICghdG8ucGFyZW50LmdldEZpZWxkKCdjaGlsZHJlbicpKSB7XHJcbiAgICAgIHRvLnBhcmVudC5zZXRGaWVsZCgnY2hpbGRyZW4nLCBbXSk7XHJcbiAgICB9XHJcbiAgICBjb25zdCB0b0NoaWxkcmVuID0gdG8ucGFyZW50LmdldEZpZWxkKCdjaGlsZHJlbicpO1xyXG5cclxuICAgIGNvbnN0IG5vZGVDb3B5ID0gdGhpcy5vcHRpb25zLmdldE5vZGVDbG9uZShub2RlKTtcclxuXHJcbiAgICB0b0NoaWxkcmVuLnNwbGljZSh0by5pbmRleCwgMCwgbm9kZUNvcHkpO1xyXG5cclxuICAgIG5vZGUudHJlZU1vZGVsLnVwZGF0ZSgpO1xyXG4gICAgaWYgKHRvLnBhcmVudC50cmVlTW9kZWwgIT09IG5vZGUudHJlZU1vZGVsKSB7XHJcbiAgICAgIHRvLnBhcmVudC50cmVlTW9kZWwudXBkYXRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5maXJlRXZlbnQoeyBldmVudE5hbWU6IFRSRUVfRVZFTlRTLmNvcHlOb2RlLCBub2RlOiBub2RlQ29weSwgdG86IHsgcGFyZW50OiB0by5wYXJlbnQuZGF0YSwgaW5kZXg6IHRvLmluZGV4IH0gfSk7XHJcbiAgfVxyXG5cclxuICBnZXRTdGF0ZSgpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGV4cGFuZGVkTm9kZUlkczogdGhpcy5leHBhbmRlZE5vZGVJZHMsXHJcbiAgICAgIGFjdGl2ZU5vZGVJZHM6IHRoaXMuYWN0aXZlTm9kZUlkcyxcclxuICAgICAgaGlkZGVuTm9kZUlkczogdGhpcy5oaWRkZW5Ob2RlSWRzLFxyXG4gICAgICBmb2N1c2VkTm9kZUlkOiB0aGlzLmZvY3VzZWROb2RlSWRcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBAYWN0aW9uIHNldFN0YXRlKHN0YXRlKSB7XHJcbiAgICBpZiAoIXN0YXRlKSByZXR1cm47XHJcblxyXG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLCB7XHJcbiAgICAgIGV4cGFuZGVkTm9kZUlkczogc3RhdGUuZXhwYW5kZWROb2RlSWRzIHx8IHt9LFxyXG4gICAgICBhY3RpdmVOb2RlSWRzOiBzdGF0ZS5hY3RpdmVOb2RlSWRzIHx8IHt9LFxyXG4gICAgICBoaWRkZW5Ob2RlSWRzOiBzdGF0ZS5oaWRkZW5Ob2RlSWRzIHx8IHt9LFxyXG4gICAgICBmb2N1c2VkTm9kZUlkOiBzdGF0ZS5mb2N1c2VkTm9kZUlkXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHN1YnNjcmliZVRvU3RhdGUoZm4pIHtcclxuICAgIGF1dG9ydW4oKCkgPT4gZm4odGhpcy5nZXRTdGF0ZSgpKSk7XHJcbiAgfVxyXG5cclxuICAvLyBwcml2YXRlIG1ldGhvZHNcclxuICBwcml2YXRlIF9jYW5Nb3ZlTm9kZShub2RlLCBmcm9tSW5kZXgsIHRvKSB7XHJcbiAgICAvLyBzYW1lIG5vZGU6XHJcbiAgICBpZiAobm9kZS5wYXJlbnQgPT09IHRvLnBhcmVudCAmJiBmcm9tSW5kZXggPT09IHRvLmluZGV4KSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gIXRvLnBhcmVudC5pc0Rlc2NlbmRhbnRPZihub2RlKTtcclxuICB9XHJcblxyXG5cclxuICBwcml2YXRlIF9maWx0ZXJOb2RlKGlkcywgbm9kZSwgZmlsdGVyRm4sIGF1dG9TaG93KSB7XHJcbiAgICAvLyBpZiBub2RlIHBhc3NlcyBmdW5jdGlvbiB0aGVuIGl0J3MgdmlzaWJsZVxyXG4gICAgbGV0IGlzVmlzaWJsZSA9IGZpbHRlckZuKG5vZGUpO1xyXG5cclxuICAgIGlmIChub2RlLmNoaWxkcmVuKSB7XHJcbiAgICAgIC8vIGlmIG9uZSBvZiBub2RlJ3MgY2hpbGRyZW4gcGFzc2VzIGZpbHRlciB0aGVuIHRoaXMgbm9kZSBpcyBhbHNvIHZpc2libGVcclxuICAgICAgbm9kZS5jaGlsZHJlbi5mb3JFYWNoKChjaGlsZCkgPT4ge1xyXG4gICAgICAgIGlmICh0aGlzLl9maWx0ZXJOb2RlKGlkcywgY2hpbGQsIGZpbHRlckZuLCBhdXRvU2hvdykpIHtcclxuICAgICAgICAgIGlzVmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBtYXJrIG5vZGUgYXMgaGlkZGVuXHJcbiAgICBpZiAoIWlzVmlzaWJsZSkge1xyXG4gICAgICBpZHNbbm9kZS5pZF0gPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgLy8gYXV0byBleHBhbmQgcGFyZW50cyB0byBtYWtlIHN1cmUgdGhlIGZpbHRlcmVkIG5vZGVzIGFyZSB2aXNpYmxlXHJcbiAgICBpZiAoYXV0b1Nob3cgJiYgaXNWaXNpYmxlKSB7XHJcbiAgICAgIG5vZGUuZW5zdXJlVmlzaWJsZSgpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGlzVmlzaWJsZTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgX2NhbGN1bGF0ZUV4cGFuZGVkTm9kZXMoc3RhcnROb2RlID0gbnVsbCkge1xyXG4gICAgc3RhcnROb2RlID0gc3RhcnROb2RlIHx8IHRoaXMudmlydHVhbFJvb3Q7XHJcblxyXG4gICAgaWYgKHN0YXJ0Tm9kZS5kYXRhW3RoaXMub3B0aW9ucy5pc0V4cGFuZGVkRmllbGRdKSB7XHJcbiAgICAgIHRoaXMuZXhwYW5kZWROb2RlSWRzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5leHBhbmRlZE5vZGVJZHMsIHtbc3RhcnROb2RlLmlkXTogdHJ1ZX0pO1xyXG4gICAgfVxyXG4gICAgaWYgKHN0YXJ0Tm9kZS5jaGlsZHJlbikge1xyXG4gICAgICBzdGFydE5vZGUuY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGQpID0+IHRoaXMuX2NhbGN1bGF0ZUV4cGFuZGVkTm9kZXMoY2hpbGQpKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgX3NldEFjdGl2ZU5vZGVTaW5nbGUobm9kZSwgdmFsdWUpIHtcclxuICAgIC8vIERlYWN0aXZhdGUgYWxsIG90aGVyIG5vZGVzOlxyXG4gICAgdGhpcy5hY3RpdmVOb2Rlc1xyXG4gICAgICAuZmlsdGVyKChhY3RpdmVOb2RlKSA9PiBhY3RpdmVOb2RlICE9PSBub2RlKVxyXG4gICAgICAuZm9yRWFjaCgoYWN0aXZlTm9kZSkgPT4ge1xyXG4gICAgICAgIHRoaXMuZmlyZUV2ZW50KHsgZXZlbnROYW1lOiBUUkVFX0VWRU5UUy5kZWFjdGl2YXRlLCBub2RlOiBhY3RpdmVOb2RlIH0pO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICBpZiAodmFsdWUpIHtcclxuICAgICAgdGhpcy5hY3RpdmVOb2RlSWRzID0ge1tub2RlLmlkXTogdHJ1ZX07XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgdGhpcy5hY3RpdmVOb2RlSWRzID0ge307XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIF9zZXRBY3RpdmVOb2RlTXVsdGkobm9kZSwgdmFsdWUpIHtcclxuICAgIHRoaXMuYWN0aXZlTm9kZUlkcyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuYWN0aXZlTm9kZUlkcywge1tub2RlLmlkXTogdmFsdWV9KTtcclxuICB9XHJcblxyXG5zdGF0aWMgZGVjb3JhdG9yczogRGVjb3JhdG9ySW52b2NhdGlvbltdID0gW1xueyB0eXBlOiBJbmplY3RhYmxlIH0sXG5dO1xuLyoqIEBub2NvbGxhcHNlICovXG5zdGF0aWMgY3RvclBhcmFtZXRlcnM6ICgpID0+ICh7dHlwZTogYW55LCBkZWNvcmF0b3JzPzogRGVjb3JhdG9ySW52b2NhdGlvbltdfXxudWxsKVtdID0gKCkgPT4gW1xuXTtcbn1cclxuXG5pbnRlcmZhY2UgRGVjb3JhdG9ySW52b2NhdGlvbiB7XG4gIHR5cGU6IEZ1bmN0aW9uO1xuICBhcmdzPzogYW55W107XG59XG4iXX0=