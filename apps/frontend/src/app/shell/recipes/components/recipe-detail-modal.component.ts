import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  inject,
  signal,
} from '@angular/core';
import type { Recipe } from '../../../core/services/recipes.service';
import { AppModalComponent } from '../../../shared/modal/app-modal.component';
import { type RecipeAvailability } from '../recipes.types';
import { AddToPlanComponent } from './add-to-plan.component';

/** Head layout: two columns only when there is a picture to put in the second. */
const HEAD_WITH_IMAGE = 'sm:grid sm:grid-cols-[minmax(0,1fr)_38%] sm:gap-x-7';

/** Long enough to read "Añadida al plan", short enough not to feel stuck. */
const SUCCESS_MS = 1100;

@Component({
  selector: 'app-recipe-detail-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppModalComponent, AddToPlanComponent],
  templateUrl: './recipe-detail-modal.component.html',
})
export class RecipeDetailModalComponent {
  @Input() set recipe(value: Recipe | null) {
    this.current.set(value);
    this.confirmingDelete.set(false);
    this.justAdded.set(false);
    this.planStep.set(false);
    // A pending auto-close belongs to the recipe that was open, not this one.
    clearTimeout(this.successTimer);
  }
  @Input() availability: RecipeAvailability | null = null;

  @Output() closed = new EventEmitter<void>();
  @Output() editRequested = new EventEmitter<Recipe>();
  @Output() deleteRequested = new EventEmitter<string>();

  private readonly destroyRef = inject(DestroyRef);
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly current = signal<Recipe | null>(null);

  confirmingDelete = signal(false);
  justAdded = signal(false);
  /** The modal shows either the recipe or the day and slot picker, never both. */
  planStep = signal(false);

  private successTimer?: ReturnType<typeof setTimeout>;
  private focusTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    this.destroyRef.onDestroy(() => {
      clearTimeout(this.successTimer);
      clearTimeout(this.focusTimer);
    });
  }

  get recipe(): Recipe | null {
    return this.current();
  }

  get headClass(): string {
    return this.current()?.imageUrl ? HEAD_WITH_IMAGE : '';
  }

  /**
   * The ingredient list is this surface's only availability read. Absent and
   * out of stock share the amber dot but not the wording: telling someone an
   * ingredient is not in their pantry when it is, at zero, reads as a bug.
   */
  ingredientNote(ingredientId: string): string {
    const status = this.availability?.ingredientStatuses.get(ingredientId);
    if (status === 'available') return '';
    return status === 'depleted' ? 'se te ha agotado' : 'no está en tu despensa';
  }

  openPlanStep(): void {
    clearTimeout(this.successTimer);
    this.justAdded.set(false);
    this.planStep.set(true);
  }

  /**
   * Dismissing the modal while a step is open closes the step first, whatever
   * the trigger was: Escape, the backdrop, or an Escape that fired in the frame
   * before focus had moved into the step.
   */
  onModalClosed(): void {
    if (this.planStep()) {
      this.closePlanStep();
      return;
    }
    this.closed.emit();
  }

  /** Focus goes back to the control that opened the step, never to `<body>`. */
  closePlanStep(): void {
    this.planStep.set(false);
    clearTimeout(this.focusTimer);
    this.focusTimer = setTimeout(
      () => this.host.querySelector<HTMLElement>('[data-open-plan-step]')?.focus(),
    );
  }

  /** Confirm the success before closing, so the action does not just vanish. */
  onAddedToPlan(): void {
    this.planStep.set(false);
    this.justAdded.set(true);
    clearTimeout(this.successTimer);
    this.successTimer = setTimeout(() => this.closed.emit(), SUCCESS_MS);
  }

  /** Any other decision cancels the pending auto-close: it would yank the
      modal away while the user is still answering. */
  askDelete(): void {
    clearTimeout(this.successTimer);
    this.justAdded.set(false);
    this.confirmingDelete.set(true);
  }

  onDelete(): void {
    const recipe = this.current();
    if (recipe) this.deleteRequested.emit(recipe.id);
  }
}
