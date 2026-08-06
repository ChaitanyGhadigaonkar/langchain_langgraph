const ChatPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return (
    <div className="flex flex-1 flex-col overflow-hidden p-4">
      <div className="flex-1 overflow-y-auto">
        <p>Chat Thread: {id}</p>
        <p className="text-muted-foreground">The chat interface will be built here.</p>
      </div>
    </div>
  );
};

export default ChatPage;
