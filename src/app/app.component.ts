import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, CommentItem } from './api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  comments: CommentItem[] = [];
  name = '';
  email = '';
  body = '';
  message = '';
  isSubmitting = false;
  lastCreatedAt = '';
  editingCommentId: number | null = null;
  pageSize = 7;
  currentPage = 1;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadComments();
  }

  loadComments(): void {
    this.apiService.getComments().subscribe({
      next: (data) => {
        this.comments = data.map((comment) => ({
          ...comment,
          createdAt: comment.createdAt ?? this.generateSimulatedDate(comment.id)
        }));
        this.currentPage = 1;
      },
      error: () => {
        this.message = 'No se pudo cargar la lista de comentarios.';
      }
    });
  }

  private generateSimulatedDate(id?: number): string {
    if (!id) {
      return new Date().toLocaleString('es-ES');
    }

    const date = new Date();
    date.setDate(date.getDate() - (500 - id));
    return date.toLocaleString('es-ES');
  }

  submitComment(): void {
    if (!this.name.trim() || !this.email.trim() || !this.body.trim()) {
      this.message = 'Por favor completa el nombre, el email y el comentario.';
      return;
    }

    this.isSubmitting = true;

    const payload = {
      name: this.name.trim(),
      email: this.email.trim(),
      body: this.body.trim()
    };

    if (this.editingCommentId != null) {
      this.apiService.updateComment(this.editingCommentId, payload).subscribe({
        next: (updated) => {
          const index = this.comments.findIndex((comment) => comment.id === this.editingCommentId);
          if (index !== -1) {
            this.comments[index] = {
              ...this.comments[index],
              ...updated,
              name: this.name.trim(),
              email: this.email.trim(),
              body: this.body.trim()
            };
          }
          this.message = 'Comentario editado con éxito.';
          this.editingCommentId = null;
          this.resetForm();
        },
        error: () => {
          this.message = 'Ocurrió un error al editar el comentario.';
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
    } else {
      this.apiService.createComment(payload).subscribe({
        next: (created) => {
          this.lastCreatedAt = new Date().toLocaleString('es-ES');
          const newComment: CommentItem = {
            ...created,
            name: this.name.trim(),
            email: this.email.trim(),
            body: this.body.trim(),
            createdAt: this.lastCreatedAt
          };
          this.comments = [newComment, ...this.comments];
          this.currentPage = 1;
          this.message = 'Comentario enviado con éxito.';
          this.resetForm();
        },
        error: () => {
          this.message = 'Ocurrió un error al enviar el comentario.';
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
    }
  }

  resetForm(): void {
    this.name = '';
    this.email = '';
    this.body = '';
  }

  editComment(comment: CommentItem): void {
    this.editingCommentId = comment.id ?? null;
    this.name = comment.name;
    this.email = comment.email ?? '';
    this.body = comment.body;
    this.message = 'Edita el comentario y presiona enviar.';
  }

  get commentCount(): number {
    return this.comments.length;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.commentCount / this.pageSize));
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, index) => index + 1);
  }

  get paginatedComments(): CommentItem[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.comments.slice(start, start + this.pageSize);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
  }

  nextPage(): void {
    this.changePage(this.currentPage + 1);
  }

  prevPage(): void {
    this.changePage(this.currentPage - 1);
  }

  get formTitle(): string {
    return this.editingCommentId != null ? 'Editar comentario' : 'Nuevo comentario';
  }

  get submitButtonText(): string {
    return this.editingCommentId != null ? 'Guardar cambios' : 'Enviar comentario';
  }
}
