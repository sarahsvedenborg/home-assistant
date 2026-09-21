"use client";

type BookFormProps = {
  onSuccess?: (message: string) => void;
};

export function BookForm(_props: BookFormProps) {
  return (
    <form className="formPanel" onSubmit={(event) => event.preventDefault()}>
      <div className="formIntro">
        <h2>Legg til bok</h2>
      </div>
    </form>
  );
}
