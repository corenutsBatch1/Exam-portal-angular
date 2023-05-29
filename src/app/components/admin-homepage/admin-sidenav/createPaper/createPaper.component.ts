import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { CreatePaper } from 'src/app/model/model/CreatePaper';
import Swal from 'sweetalert2';
import { MatPaginator } from '@angular/material/paginator';
@Component({
  selector: 'app-createPaper',
  templateUrl: './createPaper.component.html',
  styleUrls: ['./createPaper.component.css']
})
export class CreatePaperComponent implements OnInit {

  createPaper:CreatePaper=new CreatePaper();
  papers:CreatePaper[]=[];
  addpaper:boolean=true;
  viewpaper:boolean=true;
  paperid?:number;
  dataSource = new MatTableDataSource<CreatePaper>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  constructor(private http:HttpClient) { }

  fetchPaper(){
    this.http.get<CreatePaper[]>(`http://localhost:9033/api/getpaper`).subscribe(data=>{

    console.log(data)
    this.papers=data;
    this.dataSource.data=this.papers;
    this.dataSource.paginator = this.paginator;
  });
  }

  ngOnInit() {
  this.fetchPaper();
  }

  loadAddPaperpage(flag:boolean){
    this.addpaper=flag;
    this.fetchPaper();
  }



  viewPaper(flag:boolean,id:any){
  this.viewpaper=flag;
  this.paperid=id;
  console.log(id)
  console.log(this.paperid)
  }
  delete(id:any)
  {
    return this.http.delete(`http://localhost:9033/api/deletePaper/${id}`);
    // .subscribe(data=>{
    //  this.ngOnInit();
    // console.log(data)})

  }

  deletePaper(id:any){
    this.paperid=id;
    console.log(id)
    console.log(this.paperid)
    Swal.fire({
      title: "Are you sure you want to Delete? ",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel"
    })
    .then((result) => {
      if (result.isConfirmed) {
        this.delete(this.paperid).subscribe(
      reponse=>{
        Swal.fire("Deleted successfully", '', "success");
        console.log(reponse);
        console.log(id);
        this.ngOnInit();
      }
      );
      } else {
      }
       });

    }

}
