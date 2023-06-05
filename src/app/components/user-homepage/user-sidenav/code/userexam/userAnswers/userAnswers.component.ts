
import { LocationStrategy } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Marks } from 'src/app/model/model/Marks';

import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { Question } from 'src/app/model/model/Question';
import { ScheduleExam } from 'src/app/model/model/ScheduleExam';
import { useranswer } from 'src/app/model/model/useranswer';
import { MyserviceService } from 'src/app/model/myservice';
import { LoginserviceService } from 'src/app/components/loginmodal/loginservice.service';
(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;


@Component({
  selector: 'app-userAnswers',
  templateUrl: './userAnswers.component.html',
  styleUrls: ['./userAnswers.component.css']
})
export class UserAnswersComponent implements OnInit {


  code?: any;
  uid:any;
  eid:any;
  questions:Question[]=[];
  score?:number;
  userAnswers: useranswer[]=[];
  totalmarks?:number;
  obtainedMarks?:Marks;
  exam?:ScheduleExam;
  codeFlag?:boolean;
  marksInserted: boolean = false;

  constructor(private router : Router, private http: HttpClient,private route:ActivatedRoute,private service:MyserviceService,
    private locationStrategy: LocationStrategy, private loginService : LoginserviceService
    ) { }


  ngOnInit() {
    this.locationStrategy.onPopState(() => {
      history.forward();
    });
    this.uid=this.service.sendid();
    this.eid=this.service.sendeid();
    console.log("enter..."+this.uid,this.eid)
    this.route.params.subscribe(params => {
      this.code = params['code'];
      console.log('Exam code:', this.code);
      this.loadQuestions().subscribe(data=>{
                             this.questions=data;})
                      })

  this.loadScore().subscribe((data)=>{this.score=data;
                                      this.score=this.score+this.service.getcodingmarks();
                                      console.log("in answers"+this.score);
                                      if (!this.marksInserted) { // Insert marks only if they haven't been inserted before
                                        this.insertMarks();
                                        this.marksInserted = true; // Set the flag to true after inserting marks
                                      }
                                    })
  this.loadUserAnswers().subscribe((data)=>this.userAnswers=data)

  this.loadExam().subscribe(data=>{
    this.exam=data
  })
  this.loginService.isResultPage = true
}

  loadQuestions(): Observable<Question[]> {
    return this.http.get<Question[]>(`http://localhost:9033/api/getquestionsBySubjectId/${this.code}`);
  }



  loadScore(): Observable<number>{
    return this.http.get<number>(`http://localhost:9034/api/getScore/${this.uid}/${this.eid}`);
  }

  loadUserAnswers(): Observable<useranswer[]>{
    return this.http.get<useranswer[]>(`http://localhost:9033/api/getUserAnswers/${this.uid}/${this.eid}`);
  }

  loadExam():Observable<ScheduleExam>{
    return this.http.get<ScheduleExam>(`http://localhost:9033/api/getexam/${this.eid}`)
  }
  saveScore(){
    this.http.post(`http://localhost:9033/api/savemarks`,this.obtainedMarks).subscribe((data)=>console.log(data+"saved"));
  }

  insertMarks(){
    console.log(this.exam)
    this.totalmarks=this.exam?.createPaper?.totalMarks;
    console.log(this.exam?.createPaper?.totalMarks+"+++")
    console.log(this.score)
    this.obtainedMarks={

      user:{
        id:this.uid
      },
      exam:{
        id:this.eid
      },
      totalMarks: this.totalmarks,
      marks:this.score,

    }
    this.saveScore()
  }


  generatePDF() {
    const docDefinition: TDocumentDefinitions = {
      content: [
        {
          text: `Your Score is : ${this.score} / ${this.exam?.createPaper?.totalMarks}`,
          style: 'header'
        },
        {
          ol: this.questions.map((question, i) => {
            const listItems = [];

            // Use a regular expression to remove HTML tags from the question content
            const questionContent = question?.content?.replace(/<[^>]*>/g, '');

            if (questionContent) {
              listItems.push(questionContent);
            }

            // Add the answer options and user answer (if available) to the listItems array
            if (question?.subject?.name !== 'CODING') {
              listItems.push(`A) ${question?.optionA}`);
              listItems.push(`B) ${question?.optionB}`);
              listItems.push(`C) ${question?.optionC}`);
              listItems.push(`D) ${question?.optionD}`);

              const answer = this.userAnswers.find(answer => answer?.question?.id === question?.id);

              if (answer) {
                  listItems.push(`YourAnswer : ${answer.userAnswer}`);
              }

              listItems.push(`CorrectAnswer : ${question?.answer}`);
              listItems.push('\n');

            } else {
              listItems.push('\n');
            }

            // Map each list item string to an ordered list item object with a `text` property
            return listItems.map(item => ({ text: item }));
          })
        }

      ],
      styles: {
        header: {
          alignment: 'center',
          fontSize: 20,
          margin: [0, 0, 0, 10]
        }
      }
    };

    pdfMake.createPdf(docDefinition).open();
}





}
