class DragHelper {
    private static _instance: DragHelper = new DragHelper();
    public static getInstance(): DragHelper {
        return DragHelper._instance;
    }

    private readonly _helpPoint: Phaser.Math.Vector2 = new Phaser.Math.Vector2();
    private readonly _dragOffset: Phaser.Math.Vector2 = new Phaser.Math.Vector2();
    private _dragDisplayObject: Phaser.GameObjects.GameObject = null;

    public enableDrag(scene: Phaser.Scene, displayObject: Phaser.GameObjects.GameObject): void {
        displayObject.setInteractive({ draggable: true });
        displayObject.on("dragstart", (ptr, x, y) => this._dragStartHandler(displayObject, ptr, x, y));
        displayObject.on("drag", (ptr, x, y) => this._dragHandler(displayObject, ptr, x, y))
        displayObject.on("dragend", (ptr, x, y, dropped) => this._dragStopHandler(displayObject, ptr, x, y, dropped));
    }

    public disableDrag(scene: Phaser.Scene, displayObject: Phaser.GameObjects.Sprite): void {
        displayObject.removeInteractive();
        for (let event of ["dragstart", "drag", "dragend"]) {
            displayObject.off(event);
        }
    }

    private _dragStartHandler(displayObject: Phaser.GameObjects.GameObject, pointer: Phaser.Input.Pointer, dragX: number, dragY: number): void {
        if (this._dragDisplayObject) {
            console.log("Trying to drag", displayObject, "but already dragging", this._dragDisplayObject);
            return;
        }

        this._dragDisplayObject = displayObject;

        const armatureDisplay = this._dragDisplayObject.parentContainer as dragonBones.phaser.display.ArmatureDisplay;
        const bone = armatureDisplay.armature.getBoneByDisplay(this._dragDisplayObject);

        if (bone) {
            this._helpPoint.x = pointer.x;
            this._helpPoint.y = pointer.y;

            if (bone.offsetMode !== dragonBones.OffsetMode.Override) {
                bone.offsetMode = dragonBones.OffsetMode.Override;
                bone.offset.x = bone.global.x;
                bone.offset.y = bone.global.y;
            }

            this._dragOffset.x = bone.offset.x - this._helpPoint.x;
            this._dragOffset.y = bone.offset.y - this._helpPoint.y;
        }
    }

    private _dragStopHandler(displayObject: Phaser.GameObjects.GameObject, pointer: Phaser.Input.Pointer, dragX: number, dragY: number, dropped: boolean): void {
        if (!this._dragDisplayObject) {
            return;
        }
        this._dragDisplayObject = null;
    }

    private _dragHandler(displayObject: Phaser.GameObjects.GameObject, pointer: Phaser.Input.Pointer, localX: number, localY: number): void {
        if (!this._dragDisplayObject) {
            return;
        }

        const armatureDisplay = this._dragDisplayObject.parentContainer as dragonBones.phaser.display.ArmatureDisplay;
        const bone = armatureDisplay.armature.getBoneByDisplay(this._dragDisplayObject);

        if (bone) {
            this._helpPoint.x = pointer.x;
            this._helpPoint.y = pointer.y;
            bone.offset.x = this._helpPoint.x + this._dragOffset.x;
            bone.offset.y = this._helpPoint.y + this._dragOffset.y;
            bone.invalidUpdate();
        }
    }
}
