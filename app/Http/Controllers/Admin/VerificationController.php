<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Document; // Make sure your Document model exists
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VerificationController extends Controller
{
    public function index(Request $request)
    {
        $pendingDocuments = Document::with('user:id,full_name,email')
            ->where('status', 'pending')
            ->latest()
            ->paginate(10);

        return Inertia::render('Admin/Verifications/Index', [
            'pendingDocuments' => $pendingDocuments,
        ]);
    }

    public function updateDocumentStatus(Request $request, Document $document)
    {
        $validated = $request->validate([
            'status' => 'required|in:approved,rejected',
            'rejection_reason' => 'nullable|string|required_if:status,rejected',
        ]);

        $document->status = $validated['status'];
        $document->rejection_reason = $validated['status'] === 'rejected' ? $validated['rejection_reason'] : null;
        $document->save();

        // If approved, verify the user
        if ($validated['status'] === 'approved') {
            $document->user()->update(['is_verified' => true]);
        }

        return back()->with('success', 'Document status updated successfully.');
    }
}