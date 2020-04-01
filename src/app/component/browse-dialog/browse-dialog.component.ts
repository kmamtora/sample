import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatTreeNestedDataSource } from '@angular/material';
import { NestedTreeControl } from '@angular/cdk/tree';
import { ParentNode } from 'src/app/model/parent-node';

@Component({
  selector: 'app-browse-dialog',
  templateUrl: './browse-dialog.component.html',
  styleUrls: ['./browse-dialog.component.css']
})
export class BrowseDialogComponent {


  pnode: ParentNode[] = [];
  treeControl = new NestedTreeControl<ParentNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<ParentNode>();

  selected_dir = '';

  constructor(public dialogRef: MatDialogRef<BrowseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.pnode = data.dirFolder;
      this.dataSource.data = this.pnode;
     }

     /**
      * @description on dialog close
      */
    onNoClick(): void {
      this.dialogRef.close();
    }

    /**
     * @description on row clicked  from the list of directory
     * @param item
     */
    fnClick(item) {
      // Select relative path.
      var root = this.pnode[0].path;
      this.selected_dir = item.substring(root.length + 1);
    }
}
